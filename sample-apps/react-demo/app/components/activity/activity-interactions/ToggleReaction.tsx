import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { startTransition, useCallback, useOptimistic, useState } from 'react';
import { ActionButton } from '../../utility/ActionButton';

export const ToggleReaction = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const client = useFeedsClient();
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const isLiked = activity.own_reactions?.length > 0;
  const likeCount = activity.reaction_groups.like?.count ?? 0;

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
          await client?.deleteActivityReaction({
            activity_id: activity.id,
            type: 'like',
            delete_notification_activity: true,
          });
        } else {
          setState({ isLiked: true, likeCount: likeCount + 1 });
          await client?.addActivityReaction({
            activity_id: activity.id,
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
  }, [client, activity.id, isLiked, likeCount, setState]);

  return (
    <ActionButton
      onClick={toggleReaction}
      icon="favorite"
      disabled={inProgress}
      label={state.likeCount.toString()}
      isActive={state.isLiked}
      error={error}
    />
  );
};
