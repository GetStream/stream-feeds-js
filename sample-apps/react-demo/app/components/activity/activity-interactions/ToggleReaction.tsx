import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { ActionButton } from '../../utility/ActionButton';

export const ToggleReaction = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const client = useFeedsClient();
  const [optimisticState, setOptimisticState] = useState<boolean | undefined>(undefined);
  const [optimisticCount, setOptimisticCount] = useState<number | undefined>(undefined);
  const [inProgress, setInProgress] = useState(false);

  const toggleReaction = useCallback(
    async () => {
      setInProgress(true);
      let request: Promise<any> | undefined;

      if (activity.own_reactions?.length > 0) {
        setOptimisticState(false);
        setOptimisticCount((activity.reaction_groups.like?.count ?? 0) - 1);
        request = client?.deleteActivityReaction({
          activity_id: activity.id,
          type: 'like',
          delete_notification_activity: true,
        });

      } else {
        setOptimisticState(true);
        setOptimisticCount((activity.reaction_groups.like?.count ?? 0) + 1);
        request = client?.addActivityReaction({
          activity_id: activity.id,
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
    [client, activity.id, activity.own_reactions, activity.reaction_groups.like?.count],
  );

  return (
    <ActionButton
      onClick={toggleReaction}
      icon="favorite"
      disabled={inProgress}
      label={(optimisticCount ?? (activity.reaction_groups.like?.count ?? 0)).toString()}
      isActive={optimisticState ?? activity.own_reactions?.length > 0}
    />
  );
};
