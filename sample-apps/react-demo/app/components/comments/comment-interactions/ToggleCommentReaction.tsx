import type { CommentResponse } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { SecondaryActionButton } from '../../utility/ActionButton';

export const ToggleCommentReaction = ({
  comment,
  className,
}: {
  comment: CommentResponse;
  className?: string;
}) => {
  const client = useFeedsClient();
  const [optimisticState, setOptimisticState] = useState<boolean | undefined>(undefined);
  const [optimisticCount, setOptimisticCount] = useState<number | undefined>(undefined);
  const [inProgress, setInProgress] = useState(false);

  const toggleReaction = useCallback(
    async () => {
      setInProgress(true);
      let request: Promise<unknown> | undefined;

      if (comment.own_reactions?.length > 0) {
        setOptimisticState(false);
        setOptimisticCount((comment.reaction_groups?.like?.count ?? 0) - 1);
        request = client?.deleteCommentReaction({
          id: comment.id,
          type: 'like',
          delete_notification_activity: true,
        });
      } else {
        setOptimisticState(true);
        setOptimisticCount((comment.reaction_groups?.like?.count ?? 0) + 1);
        request = client?.addCommentReaction({
          id: comment.id,
          type: 'like',
          create_notification_activity: true,
        });
      }
      try {
        await request;
      } finally {
        setOptimisticState(undefined);
        setOptimisticCount(undefined);
        setInProgress(false);
      }
    },
    [client, comment.id, comment.own_reactions, comment.reaction_groups?.like?.count],
  );

  return (
    <SecondaryActionButton
      onClick={toggleReaction}
      icon="favorite"
      disabled={inProgress}
      label={(optimisticCount ?? (comment.reaction_groups?.like?.count ?? 0)).toString()}
      isActive={optimisticState ?? (comment.own_reactions?.length ?? 0) > 0}
      className={className}
    />
  );
};
