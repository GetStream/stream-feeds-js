import {
  useClientConnectedUser,
  useFeedsClient,
  useStateStore,
  type ActivityResponse,
  type PollResponseData,
  type PollState,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useMemo, useOptimistic, useRef, useState, startTransition } from 'react';
import { ErrorToast } from '../utility/ErrorToast';
import { ConfirmDialog, type ConfirmDialogHandle } from '../utility/ConfirmDialog';

type PollDisplayProps = {
  poll: PollResponseData;
  activity: ActivityResponse;
  /** When true, voting and close poll are disabled (e.g. for repost preview). Voting is also disabled when activity.preview is true (e.g. premium-gated content). */
  withoutInteractions?: boolean;
};

const pollStateSelector = (state: PollState) => ({
  name: state.name,
  description: state.description,
  options: state.options,
  vote_counts_by_option: state.vote_counts_by_option,
  own_votes_by_option_id: state.own_votes_by_option_id,
  is_closed: state.is_closed,
  enforce_unique_vote: state.enforce_unique_vote,
  allow_user_suggested_options: state.allow_user_suggested_options,
  created_by_id: state.created_by_id,
});

export const PollDisplay = ({ poll, activity, withoutInteractions = false }: PollDisplayProps) => {
  const interactionsDisabled = withoutInteractions || activity.preview === true;

  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();
  const [isVoting, setIsVoting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const confirmDialogRef = useRef<ConfirmDialogHandle>(null);
  const [suggestedOptionText, setSuggestedOptionText] = useState('');
  const [isSuggestingOption, setIsSuggestingOption] = useState(false);

  // Get the StreamPoll instance from state store for real-time updates
  const pollInstance = client?.pollFromState(poll.id);

  const pollState = useStateStore(pollInstance?.state, pollStateSelector);

  const isClosed = pollState?.is_closed ?? false;
  const enforceUniqueVote = pollState?.enforce_unique_vote ?? true;
  const allowUserSuggestedOptions = pollState?.allow_user_suggested_options ?? false;
  const isOwner = currentUser?.id === (pollState?.created_by_id);
  const options = pollState?.options
  const pollName = pollState?.name;
  const pollDescription = pollState?.description ?? '';

  const ownVotes = useMemo(
    () =>
      Object.keys(pollState?.own_votes_by_option_id ?? {}),
    [pollState?.own_votes_by_option_id]
  );

  const voteCounts = useMemo(
    () => pollState?.vote_counts_by_option ?? {},
    [pollState?.vote_counts_by_option]
  );

  const [state, setState] = useOptimistic(
    { ownVotes, voteCounts },
    (_, newState: { ownVotes: string[]; voteCounts: Record<string, number> }) => newState
  );

  const handleVote = useCallback(
    (optionId: string) => {
      if (!client || isClosed || isVoting || interactionsDisabled) return;

      setIsVoting(true);
      setError(undefined);

      const hasVotedForThisOption = ownVotes.includes(optionId);
      const hasExistingVote = ownVotes.length > 0;
      const previousVotedOptionId = hasExistingVote ? ownVotes[0] : undefined;

      startTransition(async () => {
        try {
          if (hasVotedForThisOption) {
            const voteToRemove =
              pollState?.own_votes_by_option_id?.[optionId] ??
              poll.own_votes?.find((v) => v.option_id === optionId);
            if (voteToRemove) {
              setState({
                ownVotes: ownVotes.filter((v) => v !== optionId),
                voteCounts: { ...voteCounts, [optionId]: (voteCounts[optionId] ?? 0) - 1 },
              });
              await client.deletePollVote({
                activity_id: activity.id,
                poll_id: poll.id,
                vote_id: voteToRemove.id,
              });
            }
          } else if (enforceUniqueVote && hasExistingVote && previousVotedOptionId) {
            setState({
              ownVotes: [optionId],
              voteCounts: {
                ...voteCounts,
                [previousVotedOptionId]: (voteCounts[previousVotedOptionId] ?? 0) - 1,
                [optionId]: (voteCounts[optionId] ?? 0) + 1,
              },
            });
            await client.castPollVote({
              activity_id: activity.id,
              poll_id: poll.id,
              vote: { option_id: optionId },
            });
          } else {
            setState({
              ownVotes: [...ownVotes, optionId],
              voteCounts: { ...voteCounts, [optionId]: (voteCounts[optionId] ?? 0) + 1 },
            });
            await client.castPollVote({
              activity_id: activity.id,
              poll_id: poll.id,
              vote: { option_id: optionId },
            });
          }
        } catch (e) {
          setError(e instanceof Error ? e : new Error('Failed to vote'));
        } finally {
          setIsVoting(false);
        }
      });
    },
    [
      client,
      isClosed,
      isVoting,
      enforceUniqueVote,
      ownVotes,
      voteCounts,
      pollState?.own_votes_by_option_id,
      poll.own_votes,
      poll.id,
      activity.id,
      interactionsDisabled,
      setState,
    ]
  );

  const handleClosePoll = useCallback(async () => {
    if (!client || !isOwner || isClosed || interactionsDisabled) return;

    setIsClosing(true);
    setError(undefined);

    try {
      await client.closePoll({ poll_id: poll.id });
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to close poll'));
    } finally {
      setIsClosing(false);
    }
  }, [client, isOwner, isClosed, poll.id, interactionsDisabled]);

  const handleClosePollClick = useCallback(() => {
    confirmDialogRef.current?.open();
  }, []);

  const handleSuggestOption = useCallback(async () => {
    const trimmed = suggestedOptionText.trim();
    if (!client || !trimmed || isSuggestingOption) return;

    setIsSuggestingOption(true);
    setError(undefined);

    try {
      await client.createPollOption({ poll_id: poll.id, text: trimmed });
      setSuggestedOptionText('');
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to suggest option'));
    } finally {
      setIsSuggestingOption(false);
    }
  }, [client, poll.id, suggestedOptionText, isSuggestingOption]);

  const displayTotalVotes = Object.values(state.voteCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Winner = option(s) with highest vote count when poll is closed (only if at least one vote)
  const winnerOptionIds = useMemo(() => {
    if (!isClosed || !options?.length || displayTotalVotes === 0) return [];
    const maxCount = Math.max(...options.map((o) => state.voteCounts[o.id] ?? 0));
    if (maxCount === 0) return [];
    return options.filter((o) => (state.voteCounts[o.id] ?? 0) === maxCount).map((o) => o.id);
  }, [isClosed, options, state.voteCounts, displayTotalVotes]);
  const hasWinner = winnerOptionIds.length > 0;

  return (
    <div className="w-full mt-3">
      <div
        className={`card bg-base-200 border border-base-300 ${isClosed ? 'opacity-75' : ''}`}
      >
        <div className="card-body p-4 gap-3">
          {/* Poll header with question and closed badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base">{pollName}</h3>
            {isClosed && (
              <span className="badge badge-neutral badge-sm shrink-0">
                Closed
              </span>
            )}
          </div>

          {/* Poll description */}
          {pollDescription && (
            <p className="text-sm text-base-content/70">{pollDescription}</p>
          )}

          {/* Poll options */}
          <div className="flex flex-col gap-2">
            {options && options.map((option) => {
              const voteCount = state.voteCounts[option.id] ?? 0;
              const percentage =
                displayTotalVotes > 0
                  ? Math.round((voteCount / displayTotalVotes) * 100)
                  : 0;
              const hasVoted = state.ownVotes.includes(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={interactionsDisabled ? undefined : () => handleVote(option.id)}
                  disabled={isClosed || isVoting || interactionsDisabled}
                  className={`relative w-full text-left rounded-lg border transition-all overflow-hidden ${isClosed || interactionsDisabled
                    ? 'cursor-default border-base-300'
                    : 'cursor-pointer border-base-300 hover:border-primary'
                    } ${hasVoted ? 'border-primary ring-1 ring-primary' : ''}`}
                >
                  {/* Progress bar background */}
                  <div
                    className={`absolute inset-0 transition-all ${hasVoted ? 'bg-primary/20' : 'bg-base-300/50'
                      }`}
                    style={{ width: `${percentage}%` }}
                  />

                  {/* Option content */}
                  <div className="relative flex items-center justify-between p-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <span
                        className={`break-words ${hasVoted ? 'font-medium' : ''}`}
                      >
                        {option.text}
                      </span>
                      {isClosed && hasWinner && winnerOptionIds.includes(option.id) && (
                        <span className="material-symbols-outlined text-base-content text-[1.2rem]! shrink-0" title="Winner">
                          trophy
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-sm text-base-content/70">
                      <span className="tabular-nums">{percentage}%</span>
                      <span className="text-base-content/70">
                        ({voteCount})
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Suggest an option input */}
          {allowUserSuggestedOptions && !isClosed && !interactionsDisabled && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Suggest an option..."
                className="input input-bordered input-sm flex-1"
                value={suggestedOptionText}
                onChange={(e) => setSuggestedOptionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSuggestOption();
                  }
                }}
                disabled={isSuggestingOption}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSuggestOption}
                disabled={!suggestedOptionText.trim() || isSuggestingOption}
              >
                {isSuggestingOption ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  'Add'
                )}
              </button>
            </div>
          )}

          {/* Footer with total votes and close button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-base-content/60">
              {displayTotalVotes} {displayTotalVotes === 1 ? 'vote' : 'votes'}
            </span>

            {isOwner && !isClosed && !interactionsDisabled && (
              <button
                type="button"
                onClick={handleClosePollClick}
                disabled={isClosing}
                className="btn btn-ghost btn-xs text-base-content/60 hover:text-error"
              >
                {isClosing ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <span className="material-symbols-outlined text-base">
                    lock
                  </span>
                )}
                Close Poll
              </button>
            )}
          </div>

        </div>
      </div>
      {/* Error toast for voting/closing errors */}
      <ErrorToast error={error} />
      {/* Confirmation dialog for closing poll */}
      <ConfirmDialog
        ref={confirmDialogRef}
        title="Close Poll"
        message="Are you sure you want to close this poll? This action cannot be undone and no more votes will be accepted."
        confirmLabel="Close Poll"
        confirmVariant="error"
        onConfirm={handleClosePoll}
      />
    </div>
  );
};
