import type { Feed } from '../../feed';
import type { EventPayload} from '../../../types-internal';
import { type PartializeAllBut } from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import {
  eventTriggeredByConnectedUser
} from '../../../utils/event-triggered-by-connected-user';

export type CommentDeletedPayload = PartializeAllBut<
  EventPayload<'feeds.comment.deleted'>,
  'comment'
>;

export function handleCommentDeleted(
  this: Feed,
  payload: CommentDeletedPayload,
  fromWs?: boolean,
) {
  const { comment } = payload;
  const entityId = comment.parent_id ?? comment.object_id;

  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(
        payload,
        'comment-deleted',
      ),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
      isTriggeredByConnectedUser: eventTriggeredByConnectedUser.call(this, payload),
    })
  ) {
    return;
  }

  this.state.next((currentState) => {
    let newCommentsByEntityId:
      | typeof currentState.comments_by_entity_id
      | undefined;

    const index = this.getCommentIndex(comment, currentState);

    if (index !== -1) {
      newCommentsByEntityId ??= {
        ...currentState.comments_by_entity_id,
        [entityId]: {
          ...currentState.comments_by_entity_id[entityId],
        },
      };

      newCommentsByEntityId[entityId]!.comments = [
        ...newCommentsByEntityId[entityId]!.comments!,
      ];

      newCommentsByEntityId[entityId]?.comments?.splice(index, 1);
    }

    if (typeof currentState.comments_by_entity_id[comment.id] !== 'undefined') {
      newCommentsByEntityId ??= {
        ...currentState.comments_by_entity_id,
      };

      delete newCommentsByEntityId[comment.id];
    }

    if (!newCommentsByEntityId) {
      return currentState;
    }

    return {
      ...currentState,
      comments_by_entity_id: newCommentsByEntityId,
    };
  });
}
