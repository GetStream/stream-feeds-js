import { useMemo } from 'react';
import type { AggregatedActivityResponse } from '@stream-io/feeds-react-sdk';

export const Notification = ({
  group,
  isRead,
  isSeen,
  onMarkRead,
}: {
  group: AggregatedActivityResponse;
  isRead: boolean;
  isSeen: boolean;
  onMarkRead: () => {};
}) => {
  const notificationText = useMemo(() => {
    const verb = group.activities[0].type;

    let text = '';

    const targetActivity = group.activities[0].notification_context?.target;
    const notification = {
      text: '',
      image: targetActivity?.text
        ? undefined
        : targetActivity?.attachments[0]?.image_url,
    };

    switch (verb) {
      case 'comment': {
        notification.text += `${group.activity_count} new comments on your post${targetActivity?.text ? ' ' + targetActivity?.text : ''}`;
        break;
      }
      case 'reaction': {
        notification.text += `${group.user_count} new reactions on your post${targetActivity?.text ? ' ' + targetActivity?.text : ''}`;
        break;
      }
      case 'follow': {
        const previewCount = 5;
        text = Array.from(
          new Set(group.activities.map(({ user }) => user.name)),
        )
          .slice(0, previewCount)
          .join(', ');
        const remainingActors = group.user_count - previewCount;
        if (remainingActors > 1) {
          text += ` and ${remainingActors}${group.user_count_truncated ? '+' : ''} more people`;
        } else if (remainingActors === 1) {
          text += ' and 1 more person';
        }
        text += ` started following you`;
        break;
      }
      case 'comment_reaction': {
        text += `${group.user_count} new reactions to your comment`;
        break;
      }
      default: {
        text += 'Unknown type';
        break;
      }
    }

    return text;
  }, [group]);

  return (
    <div className="flex items-center justify-between gap-1">
      <div>{notificationText}</div>
      <div className="flex items-center gap-1.5">
        {!isRead && (
          <button
            className="w-max px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={onMarkRead}
          >
            Mark read
          </button>
        )}
        {!isSeen && (
          <div className="absolute right-1 rounded-full w-2 h-2 bg-blue-500" />
        )}
      </div>
    </div>
  );
};
