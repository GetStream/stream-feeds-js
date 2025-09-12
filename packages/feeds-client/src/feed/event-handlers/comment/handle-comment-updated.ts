import { Feed } from '../../feed';
import { EventPayload, type PartializeAllBut } from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';

type CommentUpdatedPayload = PartializeAllBut<
  EventPayload<'feeds.comment.updated'>,
  'comment'
>;

export function handleCommentUpdated(
  this: Feed,
  payload: CommentUpdatedPayload,
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
        'comment-updated',
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

    if (!entityState?.comments?.length) return currentState;

    const index = this.getCommentIndex(comment, currentState);

    if (index === -1) return currentState;

    const newComments = [...entityState.comments];

    newComments[index] = comment;

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
