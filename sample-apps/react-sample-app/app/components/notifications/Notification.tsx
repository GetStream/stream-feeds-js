import { useMemo } from 'react';
import type { AggregatedActivityResponse } from '@stream-io/feeds-react-sdk';
import Link from 'next/link';
import { useUserContext } from '@/app/user-context';

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
  const { user } = useUserContext();
  const notification = useMemo(() => {
    const verb = group.activities[0].type;

    const targetActivity = group.activities[0].notification_context?.target;
    const trigger = group.activities[0].notification_context?.trigger;
    const notification = {
      text: '',
      image: targetActivity?.text
        ? undefined
        : targetActivity?.attachments?.[0]?.image_url,
      link:
        trigger?.type === 'follow'
          ? `/users/${user?.id}`
          : `/activity/${targetActivity?.id}`,
    };

    const targetActivityTruncatedText = targetActivity?.text
      ? ` "${
          targetActivity.text.length > 20
            ? targetActivity?.text?.slice(0, 20) + '...'
            : targetActivity?.text
        }"`
      : '';
    const previewCount = 5;
    const previewActors = Array.from(
      new Set(group.activities.map(({ user }) => user.name)),
    ).slice(0, previewCount);
    notification.text = previewActors.join(', ');
    const remainingActors = group.user_count - previewActors.length;

    if (remainingActors > 1) {
      notification.text += ` and ${remainingActors}${group.user_count_truncated ? '+' : ''} more people`;
    } else if (remainingActors === 1) {
      notification.text += ' and 1 more person';
    }

    switch (verb) {
      case 'comment': {
        notification.text += ` commented on your post${targetActivityTruncatedText}`;
        break;
      }
      case 'reaction': {
        notification.text += ` reacted to your post${targetActivityTruncatedText}`;
        break;
      }
      case 'follow': {
        notification.text += ` started following you`;
        break;
      }
      case 'comment_reaction': {
        notification.text += ` reacted to your comment on post${targetActivityTruncatedText}`;
        break;
      }
      default: {
        notification.text += 'Unknown type';
        break;
      }
    }

    return notification;
  }, [group, user?.id]);

  return (
    <Link href={notification.link}>
      <div className="flex items-center justify-between gap-1">
        {notification.text && <div>{notification.text}</div>}
        {notification.image && (
          <img
            src={notification.image}
            alt="Notification image"
            width={40}
            height={40}
          />
        )}
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
    </Link>
  );
};
