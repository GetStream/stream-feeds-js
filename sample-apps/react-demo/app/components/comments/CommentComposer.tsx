import type { ActivityResponse, CommentResponse, Attachment } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback, useEffect, useState } from 'react';
import { Composer } from '../common/composer/Composer';
import { isOGAttachment } from '../common/attachments/is-og-attachment';

export const CommentComposer = ({
  activity,
  parentComment,
  comment,
  onSubmitted,
}: {
  activity?: ActivityResponse;
  parentComment?: CommentResponse;
  comment?: CommentResponse;
  onSubmitted?: () => void;
}) => {
  const client = useFeedsClient();
  const [initialText, setInitialText] = useState('');
  const [initialAttachments, setInitialAttachments] = useState<Attachment[]>([]);
  const [initialMentionedUsers, setInitialMentionedUsers] = useState<Array<{ id: string; name: string }>>([]);

  const isEditing = !!comment?.id;

  useEffect(() => {
    if (comment) {
      setInitialText(comment.text ?? '');
      setInitialAttachments(comment.attachments?.filter((a) => !isOGAttachment(a)) ?? []);
      setInitialMentionedUsers(comment.mentioned_users?.map((u) => ({ id: u.id, name: u.name || u.id })) ?? []);
    }
  }, [comment]);

  const handleSubmit = useCallback(
    async (text: string, attachments: Attachment[], mentionedUserIds: string[]) => {
      if (isEditing) {
        await client?.updateComment({
          id: comment.id,
          comment: text,
          attachments,
          mentioned_user_ids: mentionedUserIds,
          handle_mention_notifications: true,
        });
      } else {
        await client?.addComment({
          object_id: activity?.id,
          object_type: 'activity',
          parent_id: parentComment?.id,
          comment: text,
          create_notification_activity: true,
          mentioned_user_ids: mentionedUserIds,
          attachments,
        });
      }
      onSubmitted?.();
    },
    [client, activity?.id, parentComment?.id, comment?.id, isEditing, onSubmitted],
  );

  return (
    <Composer
      variant="comment"
      initialText={initialText}
      initialAttachments={initialAttachments}
      initialMentionedUsers={initialMentionedUsers}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save' : 'Reply'}
    />
  );
};
