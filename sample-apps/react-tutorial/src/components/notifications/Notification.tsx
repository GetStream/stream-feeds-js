import {
  AggregatedActivityResponse,
  useIsAggregatedActivityRead,
} from '@stream-io/feeds-react-sdk';
import { useMemo } from 'react';

export const Notification = ({
  notification,
}: {
  notification: AggregatedActivityResponse;
}) => {
  const isRead = useIsAggregatedActivityRead({
    aggregatedActivity: notification,
  });
  const { text, icon } = useMemo(() => {
    let notificationText = '';

    const action = notification.activities[0].type;

    const targetActivity = notification.group.includes('follow')
      ? undefined
      : notification.activities[0].notification_context?.target;
    const activityText = targetActivity ? ` "${targetActivity.text}"` : '';

    const userCount = notification.user_count;

    notificationText += `${userCount} ${userCount === 1 ? 'person' : 'people'}`;

    let icon = '';

    switch (action) {
      case 'comment': {
        icon = '💬';
        notificationText += ` commented on your post${activityText}`;
        break;
      }
      case 'reaction': {
        icon = '❤️';
        notificationText += ` reacted to your post${activityText}`;
        break;
      }
      case 'follow': {
        icon = '👤';
        notificationText += ` started following you`;
        break;
      }
      default: {
        notificationText += 'Unknown type';
        break;
      }
    }

    return {
      text: notificationText,
      icon,
    };
  }, [notification]);

  return (
    <div className="flex flex-row items-center gap-2">
      <div>{icon}</div>
      <div>{text}</div>
      {!isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
    </div>
  );
};
