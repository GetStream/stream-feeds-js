import { isFollowResponse, isReactionResponse } from './type-assertions';
import { AddCommentReactionResponse, AddReactionResponse } from '../gen/models';

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
  const toJoin = prefix ? [prefix] : [];
  if (isFollowResponse(data)) {
    return toJoin
      .concat([data.source_feed.feed, data.target_feed.feed])
      .join('-');
  } else if (isReactionResponse(data)) {
    return toJoin
      .concat([
        (data as AddReactionResponse).activity.id ??
          (data as AddCommentReactionResponse).comment.id,
        data.reaction.type,
      ])
      .join('-');
  }
  // else if (isMemberResponse(data)) {
  // }

  throw new Error(
    `Cannot create state update queueId for data: ${JSON.stringify(data)}`,
  );
}
