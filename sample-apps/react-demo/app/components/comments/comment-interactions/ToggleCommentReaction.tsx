import type { CommentResponse } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { startTransition, useCallback, useOptimistic, useState } from 'react';
import { SecondaryActionButton } from '../../utility/ActionButton';

export const ToggleCommentReaction = ({
  comment,
  className,
}: {
  comment: CommentResponse;
  className?: string;
}) => {
  const client = useFeedsClient();
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const isLiked = (comment.own_reactions?.length ?? 0) > 0;
  const likeCount = comment.reaction_groups?.like?.count ?? 0;

  const [state, setState] = useOptimistic(
    { isLiked, likeCount },
    (_, newState: { isLiked: boolean; likeCount: number }) => newState,
  );

  const toggleReaction = useCallback(() => {
    setInProgress(true);
    setError(undefined);

    startTransition(async () => {
      try {
        if (isLiked) {
          setState({ isLiked: false, likeCount: likeCount - 1 });
          await client?.deleteCommentReaction({
            id: comment.id,
            type: 'like',
            delete_notification_activity: true,
          });
        } else {
          setState({ isLiked: true, likeCount: likeCount + 1 });
          await client?.addCommentReaction({
            id: comment.id,
            type: 'like',
            create_notification_activity: true,
          });
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setInProgress(false);
      }
    });
  }, [client, comment.id, isLiked, likeCount, setState]);

  return (
    <SecondaryActionButton
      onClick={toggleReaction}
      icon="favorite"
      disabled={inProgress}
      label={state.likeCount.toString()}
      isActive={state.isLiked}
      className={className}
      error={error}
    />
  );
};
