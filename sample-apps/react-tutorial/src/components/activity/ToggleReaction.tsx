import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';

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
          })
        : client?.addActivityReaction({
            activity_id: activity.id,
            type: 'like',
            create_notification_activity: true,
          }),
    [client, activity.id, activity.own_reactions],
  );

  return (
    <button
      type="button"
      className={`btn ${
        activity.own_reactions?.length > 0 ? 'bg-primary' : ''
      }`}
      onClick={toggleReaction}
    >
      ❤️&nbsp;
      {activity.reaction_groups.like?.count ?? 0}
    </button>
  );
};
