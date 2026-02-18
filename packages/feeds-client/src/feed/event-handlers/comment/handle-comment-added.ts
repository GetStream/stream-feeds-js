import type { Feed } from '../../feed';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import { eventTriggeredByConnectedUser } from '../../../utils/event-triggered-by-connected-user';

export type CommentAddedPayload = PartializeAllBut<
  EventPayload<'feeds.comment.added'>,
  'comment'
>;

export function handleCommentAdded(
  this: Feed,
  payload: CommentAddedPayload,
  fromWs?: boolean,
) {
  const { comment } = payload;
  const entityId = comment.parent_id ?? comment.object_id;

  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(payload, 'comment-created'),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
      isTriggeredByConnectedUser: eventTriggeredByConnectedUser.call(this, payload),
    })
  ) {
    return;
  }

  this.state.next((currentState) => {
    const entityState = currentState.comments_by_entity_id[entityId];

    if (typeof entityState?.comments === 'undefined') {
      return currentState;
    }

    const newComments = entityState?.comments ? [...entityState.comments] : [];
    const sort = entityState.pagination?.sort;
    const hasMorePages = entityState.pagination?.next !== undefined;
    const isFromCurrentUser = eventTriggeredByConnectedUser.call(this, payload);

    if (sort === 'last') {
      newComments.unshift(comment);
    } else if (sort === 'first') {
      if (isFromCurrentUser) {
        newComments.push(comment);
      } else {
        if (!hasMorePages) {
          newComments.push(comment);
        } else {
          return currentState;
        }
      }
    } else {
      newComments.push(comment);
    }

    return {
      ...currentState,
      comments_by_entity_id: {
        ...currentState.comments_by_entity_id,
        [entityId]: {
          ...currentState.comments_by_entity_id[entityId],
          comments: newComments,
        },
      },
    };
  });
}
