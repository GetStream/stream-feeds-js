import { Feed } from '../../../feed';
import { CommentResponse } from '../../../gen/models';
import { EventPayload } from '../../../types-internal';

export function handleCommentReaction(
  this: Feed,
  event: EventPayload<
    'feeds.comment.reaction.added' | 'feeds.comment.reaction.deleted'
  >,
) {
  const { comment, reaction } = event;
  const connectedUser = this.client.state.getLatestValue().connected_user;

  this.state.next((currentState) => {
    const forId = comment.parent_id ?? comment.object_id;
    const entityState = currentState.comments_by_entity_id[forId];

    const commentIndex = this.getCommentIndex(comment, currentState);

    if (commentIndex === -1) return currentState;

    const newComments = entityState?.comments?.concat([]) ?? [];

    const commentCopy: Partial<CommentResponse> = { ...comment };

    delete commentCopy.own_reactions;

    const newComment: CommentResponse = {
      ...newComments[commentIndex],
      ...commentCopy,
      // TODO: FIXME this should be handled by the backend
      latest_reactions: commentCopy.latest_reactions ?? [],
      reaction_groups: commentCopy.reaction_groups ?? {},
    };

    newComments[commentIndex] = newComment;

    if (reaction.user.id === connectedUser?.id) {
      if (event.type === 'feeds.comment.reaction.added') {
        newComment.own_reactions = newComment.own_reactions.concat(
          reaction,
        ) ?? [reaction];
      } else if (event.type === 'feeds.comment.reaction.deleted') {
        newComment.own_reactions = newComment.own_reactions.filter(
          (r) => r.type !== reaction.type,
        );
      }
    }

    return {
      ...currentState,
      comments_by_entity_id: {
        ...currentState.comments_by_entity_id,
        [forId]: {
          ...entityState,
          comments: newComments,
        },
      },
    };
  });
}
