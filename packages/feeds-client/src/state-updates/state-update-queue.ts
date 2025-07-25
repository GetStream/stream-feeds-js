import { FollowResponse } from '../gen/models';

export const shouldUpdateState = ({
  stateUpdateId,
  stateUpdateQueue,
  watch,
}: {
  stateUpdateId: string;
  stateUpdateQueue: Set<string>;
  watch: boolean;
}) => {
  if (!watch) {
    return true;
  }

  if (watch && stateUpdateQueue.has(stateUpdateId)) {
    stateUpdateQueue.delete(stateUpdateId);
    return false;
  }

  stateUpdateQueue.add(stateUpdateId);
  return true;
};

export const getStateUpdateQueueIdForFollow = (follow: FollowResponse) => {
  return `follow${follow.source_feed.fid}-${follow.target_feed.fid}`;
};

export const getStateUpdateQueueIdForUnfollow = (
  follow:
    | FollowResponse
    | { source_feed: { fid: string }; target_feed: { fid: string } },
) => {
  return `unfollow${follow.source_feed.fid}-${follow.target_feed.fid}`;
};
