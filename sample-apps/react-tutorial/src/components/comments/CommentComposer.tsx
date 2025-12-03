import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';

export const CommentComposer = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const client = useFeedsClient();
  const [commentDraft, setCommentDraft] = useState('');

  const addComment = useCallback(async () => {
    await client
      ?.addComment({
        object_id: activity.id,
        object_type: 'activity',
        comment: commentDraft,
        create_notification_activity: true,
      })
      .catch((error) => {
        // Tutorial users don't have notification feed, so we ignore the error
        if (error instanceof Error && error.message.includes('notification:')) {
          return;
        }
        throw error;
      });
    setCommentDraft('');
  }, [client, activity.id, commentDraft]);

  return (
    <div className="w-full flex flex-row gap-2">
      <input
        className="input w-full"
        placeholder="Post your reply"
        value={commentDraft}
        onChange={(e) => setCommentDraft(e.target.value)}
      />
      <button
        className="btn btn-primary"
        onClick={addComment}
        disabled={!commentDraft.trim()}
      >
        Reply
      </button>
    </div>
  );
};
