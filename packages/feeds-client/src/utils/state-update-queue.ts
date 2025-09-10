import { isFollowResponse, isReactionResponse } from './type-assertions';
import { AddCommentReactionResponse, AddReactionResponse } from '../gen/models';

export const shouldUpdateState = ({
  stateUpdateQueueId,
  stateUpdateQueue,
  watch,
  fromWs = true,
  isTriggeredByConnectedUser = false
}: {
  stateUpdateQueueId: string;
  stateUpdateQueue: Set<string>;
  watch: boolean;
  fromWs?: boolean;
  isTriggeredByConnectedUser?: boolean;
}) => {
  if (!watch || !isTriggeredByConnectedUser) {
    return true;
  }

  const prefixedStateUpdateQueueId = fromWs
    ? `ws-${stateUpdateQueueId}`
    : `http-${stateUpdateQueueId}`;
  const pairedStateUpdateQueueId = fromWs
    ? `http-${stateUpdateQueueId}`
    : `ws-${stateUpdateQueueId}`;

  if (watch && stateUpdateQueue.has(pairedStateUpdateQueueId)) {
    stateUpdateQueue.delete(pairedStateUpdateQueueId);
    return false;
  }

  stateUpdateQueue.add(prefixedStateUpdateQueueId);
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
