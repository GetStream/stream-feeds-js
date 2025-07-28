import type { Feed } from '../../../feed';
import type { EventPayload } from '../../../types-internal';

export function handleCommentAdded(
  this: Feed,
  event: EventPayload<'feeds.comment.added'>,
) {
  const { comment } = event;
  const entityId = comment.parent_id ?? comment.object_id;

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
