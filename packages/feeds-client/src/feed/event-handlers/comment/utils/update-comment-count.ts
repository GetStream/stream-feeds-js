import { Feed } from '../../../feed';
import { CommentResponse } from '../../../../gen/models';
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

  // update the activity comment_count only if we are not currently watching
  // the feed; this check can be removed once we start adding the activity.updated
  // event to the `stateUpdateQueue` as well
  if (!this.currentState.watch) {
    const activityToUpdate = this.currentState.activities?.find(
      (activity) => activity.id === parentActivityId,
    );
    if (activityToUpdate) {
      handleActivityUpdated.bind(this)({
        activity: {
          ...activityToUpdate,
          comment_count: commentCountUpdater(activityToUpdate.comment_count),
        },
      });
    }
  }
}
