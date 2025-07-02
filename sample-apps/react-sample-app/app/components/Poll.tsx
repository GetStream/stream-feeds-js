import React, { useCallback } from 'react';
import {
  ActivityResponse,
  PollState,
  PollOption as StreamPollOption,
} from '@stream-io/feeds-client';
import { useUserContext } from '@/app/user-context';
import { PollContextProvider, usePollContext } from '@/app/poll-context';
import { usePollStateStore } from '@/app/hooks/usePollStateStore';

export const Poll = ({ activity }: { activity: ActivityResponse }) => {
  if (!activity.poll) {
    return null;
  }

  return (
    <PollContextProvider activity={activity} poll={activity.poll}>
      <PollUI />
    </PollContextProvider>
  );
};

const pollSelector = (state: PollState) => ({
  name: state.name,
});

const PollUI = () => {
  const { name } = usePollStateStore(pollSelector);
  return (
    <div className="bg-[#1c1c1e] text-white rounded-xl p-4 w-64 space-y-4 shadow-lg">
      <div>
        <h2 className="text-sm font-semibold">{name}</h2>
      </div>

      <PollOptions />

      <PollButtons />
    </div>
  );
};

const PollButtons = () => {
  const { client } = useUserContext();
  const { poll, activity } = usePollContext();
  const handleSuggestOption = useCallback(
    () =>
      client?.createPollOption({
        poll_id: poll.id,
        text: `Random option ${Math.floor(Math.random() * 1000000) + 1}`,
      }),
    [client, poll.id],
  );
  const handleAddAnswer = useCallback(
    () =>
      client?.castPollVote({
        activity_id: activity.id,
        poll_id: poll.id,
        vote: {
          answer_text: `Random answer ${Math.floor(Math.random() * 1000000) + 1}`,
        },
      }),
    [activity.id, poll.id],
  );
  const handleEndVote = useCallback(
    () => client?.closePoll({ poll_id: poll.id }),
    [client, poll.id],
  );
  return (
    <div className="flex flex-col space-y-1 text-sm font-medium text-blue-500 pt-2">
      <button
        onClick={handleSuggestOption}
        className="text-left hover:underline"
      >
        Suggest an option
      </button>
      <button onClick={handleAddAnswer} className="text-left hover:underline">
        Add a comment
      </button>
      <button onClick={handleEndVote} className="text-left hover:underline">
        End vote
      </button>
    </div>
  );
};

const pollOptionsSelector = (state: PollState) => ({
  options: state.options ?? [],
});

const PollOptions = () => {
  const { options } = usePollStateStore(pollOptionsSelector);

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <PollOption
          key={option.id}
          option={option}
        />
      ))}
    </div>
  );
};

const PollOption = ({
  option,
}: {
  option: StreamPollOption;
}) => {
  const { client } = useUserContext();
  const { poll, activity } = usePollContext();
  const selector = useCallback(
    (state: PollState) => ({
      isClosed: state.is_closed,
      voteCount: state.vote_counts_by_option?.[option.id] ?? 0,
      ownVote: state.own_votes_by_option_id?.[option.id] ?? undefined,
    }),
    [option.id],
  );
  const { isClosed, voteCount, ownVote } = usePollStateStore(selector);
  const changePollVote = useCallback(
    () =>
      ownVote
        ? client?.removePollVote({
            activity_id: activity.id,
            poll_id: poll.id,
            vote_id: ownVote.id,
          })
        : client?.castPollVote({
            activity_id: activity.id,
            poll_id: poll.id,
            vote: { option_id: option.id },
          }),
    [client, activity.id, poll.id, ownVote],
  );
  return (
    <div className="flex items-center justify-between text-sm">
      <label className="flex items-center space-x-2 w-full">
        {isClosed ? null : (
          <input
            type="radio"
            checked={!!ownVote}
            onClick={changePollVote}
            className="form-radio text-blue-500 bg-transparent border-gray-600 focus:ring-0"
            readOnly={true}
          />
        )}
        <span>{option.text}</span>
        <div className="flex-1 h-1 bg-gray-700 mx-2 rounded-full" />
        <span className="text-xs text-gray-400">{voteCount}</span>
      </label>
    </div>
  );
};
