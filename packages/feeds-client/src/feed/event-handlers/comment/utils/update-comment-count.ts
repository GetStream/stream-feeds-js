import { Feed } from '@self';
import { CommentResponse } from '@self';
import { handleCommentUpdated } from '../handle-comment-updated';
import { handleActivityUpdated } from '../../activity';

export function updateCommentCount(
  this: Feed,
  {
    comment,
    replyCountUpdater,
    commentCountUpdater,
  }: {
    comment: CommentResponse;
    replyCountUpdater: (prevCount: number) => number;
    commentCountUpdater: (prevCount: number) => number;
  },
) {
  const parentActivityId = comment.object_id;
  // we update a comment if the new one is depth 2 or deeper
  if (comment?.parent_id) {
    // if the comment has a parent comment, we need to update the reply count on it
    // if the parent has a parent comment as well, parent comment is stored in a list indexed by grandparent comment id
    const grandparentCommentId =
      this.currentState.comments_by_entity_id[comment?.parent_id ?? '']
        ?.entity_parent_id;
    // pick the grandparent of the comment we are trying to add so that we
    // can update its state; if it doesn't exist the parent is an activity
    const idToUpdate = grandparentCommentId ?? parentActivityId;
    const commentToUpdate = this.currentState.comments_by_entity_id[
      idToUpdate
    ]?.comments?.find((c) => c.id === comment.parent_id);
    if (commentToUpdate) {
      handleCommentUpdated.bind(this)(
        {
          comment: {
            ...commentToUpdate,
            reply_count: replyCountUpdater(commentToUpdate.reply_count),
          },
        },
        false,
      );
    }
  }

  // finally, update the activity comment_count
  const activityToUpdate = this.currentState.activities?.find(
    (activity) => activity.id === parentActivityId,
  );
  if (activityToUpdate) {
    handleActivityUpdated.bind(this)({
      activity: {
        ...activityToUpdate,
        comment_count: commentCountUpdater(activityToUpdate.comment_count),
      },
    }, false);
  }
}
