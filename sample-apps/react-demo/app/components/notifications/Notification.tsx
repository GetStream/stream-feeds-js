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
    <div className="flex flex-row items-start gap-3 w-full min-w-0">
      {!isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />}
      <div className="flex-1 min-w-0">{content}</div>
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
          <NavLink href={`/profile/${actor.id}`} className="font-semibold underline decoration-base-content/20 hover:decoration-base-content/50 underline-offset-2">
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
    <div className="flex flex-row -space-x-1.5">
      {previewActors.map((actor) => (
        <Avatar key={actor.id} user={actor} className="size-6 ring-2 ring-base-100" />
      ))}
    </div>
  );
};

const NotificationContent = ({ icon, postLink, notification, activityText, actionText }: { icon: string, postLink?: string, notification: AggregatedActivityResponse, actionText: string, activityText?: string }) => {
  return (
    <div className="flex flex-row gap-3 items-start w-full min-w-0">
      <span className="material-symbols-outlined text-primary text-[18px]! shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <ActorAvatars notification={notification} />
        <p className="text-[13px] leading-relaxed text-base-content/80">
          <Actors notification={notification} /> {actionText}
          {activityText && postLink && (
            <span> <NavLink href={`${postLink}`} className="text-base-content underline decoration-base-content/20 hover:decoration-base-content/50 underline-offset-2">{activityText}</NavLink></span>
          )}
        </p>
      </div>
    </div>
  );
};
