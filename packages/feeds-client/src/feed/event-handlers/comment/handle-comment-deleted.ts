import { Feed } from '../../../feed';
import { EventPayload } from '../../../types-internal';

export function handleCommentDeleted(
  this: Feed,
  { comment }: EventPayload<'feeds.comment.deleted'>,
) {
  const entityId = comment.parent_id ?? comment.object_id;

  this.state.next((currentState) => {
    const newCommentsByEntityId = {
      ...currentState.comments_by_entity_id,
      [entityId]: {
        ...currentState.comments_by_entity_id[entityId],
      },
    };

    const index = this.getCommentIndex(comment, currentState);

    if (newCommentsByEntityId?.[entityId]?.comments?.length && index !== -1) {
      newCommentsByEntityId[entityId].comments = [
        ...newCommentsByEntityId[entityId].comments,
      ];

      newCommentsByEntityId[entityId]?.comments?.splice(index, 1);
    }

    delete newCommentsByEntityId[comment.id];

    return {
      ...currentState,
      comments_by_entity_id: newCommentsByEntityId,
    };
  });
}
