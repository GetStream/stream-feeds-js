import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';
import { ActionButton } from '../../utility/ActionButton';

export const ToggleReaction = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const client = useFeedsClient();

  const toggleReaction = useCallback(
    () =>
      activity.own_reactions?.length > 0
        ? client?.deleteActivityReaction({
          activity_id: activity.id,
          type: 'like',
          delete_notification_activity: true,
        })
        : client?.addActivityReaction({
          activity_id: activity.id,
          type: 'like',
          create_notification_activity: true,
        }),
    [client, activity.id, activity.own_reactions],
  );

  return (
    <ActionButton
      onClick={toggleReaction}
      icon="favorite"
      label={(activity.reaction_groups.like?.count ?? 0).toString()}
      isActive={activity.own_reactions?.length > 0}
    />
  );
};
