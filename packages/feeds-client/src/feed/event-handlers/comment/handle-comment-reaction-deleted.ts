import type { Feed } from '../../feed';
import type { EventPayload} from '../../../types-internal';
import { type PartializeAllBut } from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';

export type CommentReactionDeletedPayload = PartializeAllBut<
  EventPayload<'feeds.comment.reaction.deleted'>,
  'comment' | 'reaction'
>;

export function handleCommentReactionDeleted(
  this: Feed,
  payload: CommentReactionDeletedPayload,
  fromWs?: boolean,
) {
  const { comment, reaction } = payload;
  const connectedUser = this.client.state.getLatestValue().connected_user;

  const isOwnReaction = reaction.user.id === connectedUser?.id;

  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(
        payload,
        'comment-reaction-deleted',
      ),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
      isTriggeredByConnectedUser: isOwnReaction,
    })
  ) {
    return;
  }

  this.state.next((currentState) => {
    const commentIndex = this.getCommentIndex(comment, currentState);

    if (commentIndex === -1) return currentState;

    const forId = comment.parent_id ?? comment.object_id;

    const entityState = currentState.comments_by_entity_id[forId];

    const newComments = entityState?.comments?.concat([]) ?? [];

    let ownReactions = newComments[commentIndex].own_reactions;

    if (isOwnReaction) {
      ownReactions = ownReactions.filter(
        (r) => r.type !== reaction.type,
      );
    }

    newComments[commentIndex] = {
      ...newComments[commentIndex],
      reaction_count: comment.reaction_count ?? 0,
      // TODO: FIXME this should be handled by the backend
      latest_reactions: comment.latest_reactions ?? [],
      reaction_groups: comment.reaction_groups ?? {},
      own_reactions: ownReactions,
    };

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
