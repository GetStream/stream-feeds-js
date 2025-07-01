import React, { useCallback } from 'react';
import {
  ActivityResponse,
  StreamPoll,
  PollState,
} from '@stream-io/feeds-client';
import { useStateStore } from '@/app/hooks/useStateStore';
import { useUserContext } from '@/app/user-context';

export const Poll = ({
  poll,
  activity,
}: {
  poll: StreamPoll;
  activity: ActivityResponse;
}) => {
  return (
    <div className="bg-[#1c1c1e] text-white rounded-xl p-4 w-64 space-y-4 shadow-lg">
      <div>
        <h2 className="text-sm font-semibold">Testing something for polls</h2>
      </div>

      <PollOptions poll={poll} activity={activity} />

      <div className="flex flex-col space-y-1 text-sm font-medium text-blue-500 pt-2">
        <button className="text-left hover:underline">Suggest an option</button>
        <button className="text-left hover:underline">Add a comment</button>
        <button className="text-left hover:underline">View results</button>
        <button className="text-left hover:underline">End vote</button>
      </div>
    </div>
  );
};

const pollOptionsSelector = (state: PollState) => ({
  options: state.options ?? [],
  voteCountsByOption: state.vote_counts_by_option ?? {},
  ownVotesByOptionId: state.ownVotesByOptionId ?? {},
});

const PollOptions = ({
  poll,
  activity,
}: {
  poll: StreamPoll;
  activity: ActivityResponse;
}) => {
  const { client } = useUserContext();
  const { options, voteCountsByOption, ownVotesByOptionId } = useStateStore(
    poll.state,
    pollOptionsSelector,
  );
  const changePollVote = useCallback(
    (optionId: string) =>
      ownVotesByOptionId[optionId]
        ? client?.removePollVote({
            activity_id: activity.id,
            poll_id: poll.id,
            vote_id: ownVotesByOptionId[optionId].id,
          })
        : client?.castPollVote({
            activity_id: activity.id,
            poll_id: poll.id,
            vote: { option_id: optionId },
          }),
    [client, activity, poll, ownVotesByOptionId],
  );
  
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-between text-sm"
        >
          <label className="flex items-center space-x-2 w-full">
            <input
              type="radio"
              checked={!!ownVotesByOptionId[option.id]}
              onClick={() => changePollVote(option.id)}
              className="form-radio text-blue-500 bg-transparent border-gray-600 focus:ring-0"
              readOnly={true}
            />
            <span>{option.text}</span>
            <div className="flex-1 h-1 bg-gray-700 mx-2 rounded-full" />
            <span className="text-xs text-gray-400">
              {voteCountsByOption[option.id]}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};
