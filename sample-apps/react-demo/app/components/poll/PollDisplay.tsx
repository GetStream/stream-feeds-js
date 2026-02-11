import {
  useClientConnectedUser,
  useFeedsClient,
  useStateStore,
  type ActivityResponse,
  type PollResponseData,
  type PollState,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useMemo, useState, useRef, startTransition, useOptimistic } from 'react';
import { ErrorToast } from '../utility/ErrorToast';
import { ConfirmDialog, type ConfirmDialogHandle } from '../utility/ConfirmDialog';

type PollDisplayProps = {
  poll: PollResponseData;
  activity: ActivityResponse;
};

const pollStateSelector = (state: PollState) => ({
  name: state.name,
  options: state.options,
  vote_counts_by_option: state.vote_counts_by_option,
  own_votes_by_option_id: state.own_votes_by_option_id,
  is_closed: state.is_closed,
  enforce_unique_vote: state.enforce_unique_vote,
  created_by_id: state.created_by_id,
});

export const PollDisplay = ({ poll, activity }: PollDisplayProps) => {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();
  const [isVoting, setIsVoting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const confirmDialogRef = useRef<ConfirmDialogHandle>(null);

  // Get the StreamPoll instance from state store for real-time updates
  const pollInstance = client?.pollFromState(poll.id);

  const pollState = useStateStore(pollInstance?.state, pollStateSelector);

  const isClosed = pollState?.is_closed ?? false;
  const enforceUniqueVote = pollState?.enforce_unique_vote ?? true;
  const isOwner = currentUser?.id === (pollState?.created_by_id);
  const options = pollState?.options;
  const pollName = pollState?.name;

  const ownVotes = useMemo(
    () => Object.keys(pollState?.own_votes_by_option_id ?? {}),
    [pollState?.own_votes_by_option_id]
  );

  const voteCounts = pollState?.vote_counts_by_option ?? {};

  type OptimisticUpdate = {
    optionId: string;
    action: 'add' | 'remove' | 'change';
    previousOptionId?: string; // Used for 'change' action in single-choice mode
  };

  const [optimisticVoteCounts, setOptimisticVoteCounts] = useOptimistic(
    voteCounts,
    (current: Record<string, number>, update: OptimisticUpdate) => {
      const newCounts = { ...current };
      if (update.action === 'add') {
        newCounts[update.optionId] = (newCounts[update.optionId] ?? 0) + 1;
      } else if (update.action === 'remove') {
        newCounts[update.optionId] = Math.max(0, (newCounts[update.optionId] ?? 0) - 1);
      } else if (update.action === 'change' && update.previousOptionId) {
        // Single-choice: decrement old option, increment new option
        newCounts[update.previousOptionId] = Math.max(0, (newCounts[update.previousOptionId] ?? 0) - 1);
        newCounts[update.optionId] = (newCounts[update.optionId] ?? 0) + 1;
      }
      return newCounts;
    }
  );

  const [optimisticOwnVotes, setOptimisticOwnVotes] = useOptimistic(
    ownVotes,
    (current: string[], update: OptimisticUpdate) => {
      let votes = [...current];
      if (update.action === 'add') {
        votes.push(update.optionId);
      } else if (update.action === 'remove') {
        votes = votes.filter(vote => vote !== update.optionId);
      } else if (update.action === 'change') {
        // Single-choice: clear all previous votes, add new one
        votes = [update.optionId];
      }
      return votes;
    }
  );

  const handleVote = useCallback(
    async (optionId: string) => {
      if (!client || isClosed || isVoting) return;

      setIsVoting(true);
      setError(undefined);

      const hasVotedForThisOption = optimisticOwnVotes.includes(optionId);
      const hasExistingVote = optimisticOwnVotes.length > 0;
      const previousVotedOptionId = hasExistingVote ? Array.from(optimisticOwnVotes)[0] : undefined;

      startTransition(async () => {
        try {
          if (hasVotedForThisOption) {
            // User clicked on an option they already voted for - remove the vote
            // Try to get vote from reactive state first, fallback to props
            const voteToRemove =
              pollState?.own_votes_by_option_id?.[optionId] ??
              poll.own_votes?.find((v) => v.option_id === optionId);
            if (voteToRemove) {
              const update = { optionId, action: 'remove' as const };
              setOptimisticOwnVotes(update);
              setOptimisticVoteCounts(update);
              await client.deletePollVote({
                activity_id: activity.id,
                poll_id: poll.id,
                vote_id: voteToRemove.id,
              });
            }
          } else if (enforceUniqueVote && hasExistingVote && previousVotedOptionId) {
            // Single-choice mode: change vote from previous option to new option
            // The server handles this automatically when casting a new vote with enforce_unique_vote=true
            const update = { optionId, action: 'change' as const, previousOptionId: previousVotedOptionId };
            setOptimisticOwnVotes(update);
            setOptimisticVoteCounts(update);
            await client.castPollVote({
              activity_id: activity.id,
              poll_id: poll.id,
              vote: { option_id: optionId },
            });
          } else {
            // Add a new vote (multiple choice or first vote in single choice)
            const update = { optionId, action: 'add' as const };
            setOptimisticOwnVotes(update);
            setOptimisticVoteCounts(update);
            await client.castPollVote({
              activity_id: activity.id,
              poll_id: poll.id,
              vote: { option_id: optionId },
            });
          }
        } catch (e) {
          // Error toast will display the error - optimistic state auto-reverts
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
      optimisticOwnVotes,
      pollState?.own_votes_by_option_id,
      poll.own_votes,
      poll.id,
      activity.id,
      setOptimisticOwnVotes,
      setOptimisticVoteCounts,
    ]
  );

  const handleClosePoll = useCallback(async () => {
    if (!client || !isOwner || isClosed) return;

    setIsClosing(true);
    setError(undefined);

    try {
      await client.closePoll({ poll_id: poll.id });
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to close poll'));
    } finally {
      setIsClosing(false);
    }
  }, [client, isOwner, isClosed, poll.id]);

  const handleClosePollClick = useCallback(() => {
    confirmDialogRef.current?.open();
  }, []);

  // Calculate optimistic total votes
  const optimisticTotalVotes = Object.values(optimisticVoteCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Winner = option(s) with highest vote count when poll is closed (only if at least one vote)
  const winnerOptionIds = useMemo(() => {
    if (!isClosed || !options?.length || optimisticTotalVotes === 0) return [];
    const maxCount = Math.max(...options.map((o) => optimisticVoteCounts[o.id] ?? 0));
    if (maxCount === 0) return [];
    return options.filter((o) => (optimisticVoteCounts[o.id] ?? 0) === maxCount).map((o) => o.id);
  }, [isClosed, options, optimisticVoteCounts, optimisticTotalVotes]);
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

          {/* Poll options */}
          <div className="flex flex-col gap-2">
            {options && options.map((option) => {
              const voteCount = optimisticVoteCounts[option.id] ?? 0;
              const percentage =
                optimisticTotalVotes > 0
                  ? Math.round((voteCount / optimisticTotalVotes) * 100)
                  : 0;
              const hasVoted = optimisticOwnVotes.includes(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  disabled={isClosed || isVoting}
                  className={`relative w-full text-left rounded-lg border transition-all overflow-hidden ${isClosed
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
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`truncate ${hasVoted ? 'font-medium' : ''}`}
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
                      <span className="text-base-content/50">
                        ({voteCount})
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer with total votes and close button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-base-content/60">
              {optimisticTotalVotes} {optimisticTotalVotes === 1 ? 'vote' : 'votes'}
            </span>

            {isOwner && !isClosed && (
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
