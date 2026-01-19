import type { CommentResponse } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';
import { SecondaryActionButton } from '../../utility/ActionButton';

export const ToggleCommentReaction = ({
  comment,
  className,
}: {
  comment: CommentResponse;
  className?: string;
}) => {
  const client = useFeedsClient();

  const toggleReaction = useCallback(
    () =>
      comment.own_reactions?.length > 0
        ? client?.deleteCommentReaction({
          id: comment.id,
          type: 'like',
          delete_notification_activity: true,
        })
        : client?.addCommentReaction({
          id: comment.id,
          type: 'like',
          create_notification_activity: true,
        }),
    [client, comment.id, comment.own_reactions],
  );

  return (
    <SecondaryActionButton
      onClick={toggleReaction}
      icon="favorite"
      label={(comment.reaction_groups?.like?.count ?? 0).toString()}
      isActive={comment.own_reactions?.length > 0}
      className={className}
    />
  );
};
