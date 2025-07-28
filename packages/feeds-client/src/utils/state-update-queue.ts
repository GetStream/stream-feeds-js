import { isFollowResponse } from './type-assertions';

export const shouldUpdateState = ({
  stateUpdateQueueId,
  stateUpdateQueue,
  watch,
}: {
  stateUpdateQueueId: string;
  stateUpdateQueue: Set<string>;
  watch: boolean;
}) => {
  if (!watch) {
    return true;
  }

  if (watch && stateUpdateQueue.has(stateUpdateQueueId)) {
    stateUpdateQueue.delete(stateUpdateQueueId);
    return false;
  }

  stateUpdateQueue.add(stateUpdateQueueId);
  return true;
};

export function getStateUpdateQueueId(
  data: object,
  prefix?: 'deleted' | 'updated' | 'created' | (string & {}),
) {
  if (isFollowResponse(data)) {
    const toJoin = [data.source_feed.fid, data.target_feed.fid];
    if (prefix) {
      toJoin.unshift(prefix);
    }
    return toJoin.join('-');
  }
  // else if (isMemberResponse(data)) {
  // }

  throw new Error(
    `Cannot create state update queueId for data: ${JSON.stringify(data)}`,
  );
}
