import type {
  FollowResponse,
} from '../gen/models';
import type {
  ActivityReactionAddedPayload,
  ActivityReactionDeletedPayload,
  ActivityUpdatedPayload,
  CommentAddedPayload,
  CommentDeletedPayload,
  CommentReactionAddedPayload,
  CommentReactionDeletedPayload,
  CommentUpdatedPayload,
} from '../feed';
import { ensureExhausted } from './ensure-exhausted';

export type StateUpdateQueuePrefix =
  | 'activity-updated'
  | 'activity-reaction-created'
  | 'activity-reaction-deleted'
  | 'comment-reaction-created'
  | 'comment-reaction-deleted'
  | 'follow-created'
  | 'follow-deleted'
  | 'follow-updated'
  | 'comment-created'
  | 'comment-deleted'
  | 'comment-updated';

type StateUpdateQueuePayloadByPrefix = {
  'activity-updated': ActivityUpdatedPayload;
  'activity-reaction-created': ActivityReactionAddedPayload;
  'activity-reaction-deleted': ActivityReactionDeletedPayload;
  'comment-reaction-created': CommentReactionAddedPayload;
  'comment-reaction-deleted': CommentReactionDeletedPayload;
  'follow-created': FollowResponse;
  'follow-deleted': FollowResponse;
  'follow-updated': FollowResponse;
  'comment-created': CommentAddedPayload;
  'comment-deleted': CommentDeletedPayload;
  'comment-updated': CommentUpdatedPayload;
};

// Union of ([payload, prefix]) tuples:
export type StateUpdateQueuePairTuples = {
  [K in StateUpdateQueuePrefix]: [StateUpdateQueuePayloadByPrefix[K], K];
}[StateUpdateQueuePrefix];

/**
 * Decide whether to apply a state update that may arrive twice (HTTP + WS)
 * for the same logical change initiated by the connected user.
 *
 * ###### Why
 * When `watch` is enabled and the connected user triggers a change, you often get:
 * - an immediate local/HTTP-driven update (e.g., optimistic UI, REST response)
 * - a subsequent server broadcast over WebSocket for the same change
 *
 * This helper suppresses the duplicate so you apply the update exactly once.
 *
 * ###### How it works
 * - Builds a prefixed key from `stateUpdateQueueId` and the transport:
 *   - HTTP → `http-${id}`
 *   - WS   → `ws-${id}`
 * - If the *paired* key already exists (e.g., WS sees `http-${id}` or HTTP sees `ws-${id}`),
 *   it removes that key and returns `false` (skip as duplicate).
 * - Otherwise it enqueues the current prefixed key and returns `true` (apply update).
 *
 * ###### When it returns `true`
 * - `watch` is `false` -> no deduping needed
 * - `isTriggeredByConnectedUser` is `false` -> dedupe only targets that echo the initiator's
 * - First arrival for a given `id` and transport pair
 *
 * ###### When it returns `false`
 * The *second* arrival for the same logical `{id}` from the *other* transport is detected
 * (e.g., you already saw `http-${id}`, now a `ws-${id}` arrives).
 *
 * ###### Example
 * ```ts
 * const queue = new Set<string>();
 *
 * 1) User follows someone → HTTP path resolves first
 * if (shouldUpdateState({
 *   stateUpdateQueueId: 'follow:targetUserId',
 *   stateUpdateQueue: queue,
 *   watch: true,
 *   fromWs: false,
 *   isTriggeredByConnectedUser: true,
 * })) {
 *   applyFollowLocally();
 * }
 *
 * 2) A moment later WS echoes the same follow
 * if (shouldUpdateState({
 *   stateUpdateQueueId: 'follow:targetUserId',
 *   stateUpdateQueue: queue,
 *   watch: true,
 *   fromWs: true,
 *   isTriggeredByConnectedUser: true,
 * })) {
 *   // This will return false → skip duplicate
 *   applyFollowLocally();
 * }
 * ```
 *
 * ###### Reverse order also works
 * If WS lands first and HTTP lands second, the second one will be skipped.
 *
 * ###### Choosing good IDs
 * Use a stable, collision-free `stateUpdateQueueId` for the same logical change.
 * Examples:
 * - `follow-created-${sourceFeed.id}-${targetFeed.id}`
 * - `activity-reaction-added-${activity.id}-${reaction.type}`
 *
 * @param config
 * @param config.stateUpdateQueueId - Stable identifier for the logical change
 * @param config.stateUpdateQueue - A shared Set used as a small dedupe cache
 * @param config.watch - Whether watch/broadcast mode is enabled
 * @param config.fromWs - `true` if this event came from WebSocket; `false` for HTTP (default: true)
 * @param config.isTriggeredByConnectedUser - Only dedupe echoes of our own actions
 *
 * @returns {boolean} Whether or not the state update should be applied.
 */
export const shouldUpdateState = ({
  stateUpdateQueueId,
  stateUpdateQueue,
  watch,
  fromWs = true,
  isTriggeredByConnectedUser = false,
}: {
  stateUpdateQueueId?: string;
  stateUpdateQueue: Set<string>;
  watch: boolean;
  fromWs?: boolean;
  isTriggeredByConnectedUser: boolean;
}): boolean => {
  if (!watch || !isTriggeredByConnectedUser || !stateUpdateQueueId) {
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
  ...args: StateUpdateQueuePairTuples
) {
  const [data, prefix] = args;
  const toJoin = [prefix as string];

  switch (prefix) {
    case 'activity-updated': {
      return toJoin.concat([data.activity.id]).join('-')
    }
    case 'activity-reaction-created':
    case 'activity-reaction-deleted': {
      return toJoin
        .concat([
          data.activity.id,
          data.reaction.type,
        ])
        .join('-');
    }
    case 'comment-reaction-created':
    case 'comment-reaction-deleted': {
      return toJoin
        .concat([
          data.comment.id,
          data.reaction.type,
        ])
        .join('-');
    }
    case 'comment-created':
    case 'comment-deleted':
    case 'comment-updated': {
      return toJoin.concat([data.comment.id]).join('-')
    }
    case 'follow-created':
    case 'follow-deleted':
    case 'follow-updated': {
      return toJoin
        .concat([data.source_feed.feed, data.target_feed.feed])
        .join('-');
    }
    default: {
      ensureExhausted(data, 'Encountered unknown state update queue prefix.')
    }
  }
}
