import { Feed } from '../../../feed';
import { EventPayload } from '../../../types-internal';

export function handleCommentUpdated(
  this: Feed,
  event: EventPayload<'feeds.comment.updated'>,
) {
  const { comment } = event;
  const entityId = comment.parent_id ?? comment.object_id;

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
