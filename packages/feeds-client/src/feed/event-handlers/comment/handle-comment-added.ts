import type { Feed } from '../../feed';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';

type CommentAddedPayload = PartializeAllBut<
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

  // FIXME: This is not the correct way to check if an event was triggered by us.
  //        Use event.user.id instead.
  const isOwnComment =
    this.client.state.getLatestValue().connected_user?.id === comment.user.id;

  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(
        comment,
        'comment-added',
      ),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
      isTriggeredByConnectedUser: isOwnComment,
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

    if (entityState.pagination?.sort === 'last') {
      newComments.unshift(comment);
    } else {
      // 'first' and other sort options
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
