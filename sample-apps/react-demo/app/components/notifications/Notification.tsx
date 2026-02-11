import type { AggregatedActivityResponse, UserResponse } from '@stream-io/feeds-react-sdk';
import { useIsAggregatedActivityRead } from '@stream-io/feeds-react-sdk';
import { useMemo } from 'react';
import { NavLink } from '../utility/NavLink';
import { Avatar } from '../utility/Avatar';

const truncateText = (text: string, maxLength = 20) => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export const Notification = ({
  notification,
}: {
  notification: AggregatedActivityResponse;
}) => {
  const isRead = useIsAggregatedActivityRead({
    aggregatedActivity: notification,
  });
  const content = useMemo(() => {
    const action = notification.activities[0].type;

    const targetActivity = notification.group.includes('follow')
      ? undefined
      : notification.activities[0].notification_context?.target;
    let activityText = targetActivity ? (targetActivity.text ?? targetActivity.parent_activity?.text) : '';
    activityText = activityText ? `"${truncateText(activityText)}"` : '';

    let notificationContent: React.ReactNode;
    switch (action) {
      case 'comment': {
        notificationContent = <NotificationContent icon="chat_bubble" postLink={`/activity/${targetActivity?.id}`} notification={notification} actionText="commented on your post" activityText={activityText} />;
        break;
      }
      case 'reaction': {
        notificationContent = <NotificationContent icon="favorite" postLink={`/activity/${targetActivity?.id}`} notification={notification} actionText="reacted to your post" activityText={activityText} />;
        break;
      }
      case 'comment_reaction': {
        notificationContent = <NotificationContent icon="favorite" postLink={`/activity/${targetActivity?.id}`} notification={notification} actionText="reacted to your comment on post" activityText={activityText} />;
        break;
      }
      case 'comment_reply': {
        notificationContent = <NotificationContent icon="chat_bubble" postLink={`/activity/${targetActivity?.id}`} notification={notification} actionText="replied to your comment on post" activityText={activityText} />;
        break;
      }
      case 'follow': {
        notificationContent = <NotificationContent icon="person" notification={notification} actionText="started following you" />;
        break;
      }
      case 'mention': {
        notificationContent = <NotificationContent icon="alternate_email" postLink={`/activity/${targetActivity?.id}`} notification={notification} actionText="mentioned you in a post" activityText={activityText} />;
        break;
      }
      case 'comment_mention': {
        notificationContent = <NotificationContent icon="alternate_email" postLink={`/activity/${targetActivity?.id}`} notification={notification} actionText="mentioned you in a comment on post" activityText={activityText} />;
        break;
      }
      default: {
        notificationContent = <div>Unknown type</div>;
        break;
      }
    }

    return notificationContent;
  }, [notification]);

  return (
    <div className="flex flex-row items-center justify-between gap-2 w-full max-w-full">
      <div className={`flex flex-row items-center gap-2 flex-1 min-w-0 ${!isRead ? '-ml-2' : ''}`}>
        {!isRead && <div className="w-2 h-2 -mr-2 rounded-full bg-primary flex-shrink-0" />}
        <div className="flex-1 min-w-0">{content}</div>
      </div>
    </div>
  );
};

const getPreviewActors = (notification: AggregatedActivityResponse) => {
  const previewCount = 2;
  const uniqueUsers: Record<string, UserResponse> = {};
  notification.activities.forEach(({ user: u }) => {
    uniqueUsers[u.id] = u;
  });
  return Array.from(Object.values(uniqueUsers)).slice(0, previewCount);
};

const Actors = ({ notification }: { notification: AggregatedActivityResponse }) => {
  const previewActors = getPreviewActors(notification);

  const remainingActors = notification.user_count - previewActors.length;
  let remainingActorsText = '';
  if (remainingActors > 1) {
    remainingActorsText += ` and ${remainingActors}${notification.user_count_truncated ? '+' : ''} more people`;
  } else if (remainingActors === 1) {
    remainingActorsText += ' and 1 more person';
  }

  return (
    <>
      {previewActors.map((actor, index) => (
        <span key={actor.id}>
          {index > 0 ? remainingActors > 0 ? ', ' : ' and ' : ''}
          <NavLink href={`/profile/${actor.id}`} className="link">
            {actor.name}
          </NavLink>
        </span>
      ))}
      {remainingActorsText}
    </>
  );
};

const ActorAvatars = ({ notification }: { notification: AggregatedActivityResponse }) => {
  const previewActors = getPreviewActors(notification);
  return (
    <div className="flex flex-row">
      {previewActors.map((actor, index) => (
        <div key={actor.id} className={index > 0 ? '-ml-1' : ''}>
          <Avatar user={actor} className="size-5" />
        </div>
      ))}
    </div>
  );
};

const NotificationContent = ({ icon, postLink, notification, activityText, actionText }: { icon: string, postLink?: string, notification: AggregatedActivityResponse, actionText: string, activityText?: string }) => {
  return (
    <div className="flex flex-row gap-2 items-center w-full min-w-0">
      <span className="material-symbols-outlined text-primary text-[1.2rem]! flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <Actors notification={notification} /> <span>{actionText}</span>
        {activityText && postLink && (
          <span> <NavLink href={`${postLink}`} className="link">{activityText}</NavLink></span>
        )}
      </div>
      <ActorAvatars notification={notification} />
    </div>
  );
};
