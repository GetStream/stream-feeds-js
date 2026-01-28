import type { CommentResponse } from '@stream-io/feeds-react-sdk';
import { SecondaryActionButton } from '../../utility/ActionButton';

export const ReplyToComment = ({
  comment,
  isReplying,
  onToggleReplying,
}: {
  comment: CommentResponse;
  isReplying: boolean;
  onToggleReplying: () => void;
}) => {
  return (
    <SecondaryActionButton
      onClick={onToggleReplying}
      icon="chat_bubble"
      label={comment.reply_count > 0 ? comment.reply_count.toString() : 'Reply'}
      isActive={isReplying}
    />
  );
};
