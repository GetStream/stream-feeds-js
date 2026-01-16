import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useClientConnectedUser } from '@stream-io/feeds-react-sdk';
import { useMemo } from 'react';
import { ToggleFollowButton } from '../ToggleFollowButton';
import { ToggleReaction } from './ToggleReaction';
import { formatDistanceToNow } from 'date-fns';
import { ToggleBookmark } from './ToggleBookmark';
import { NavLink } from '../utility/NavLink';
import { Avatar } from '../utility/Avatar';

export const Activity = ({ activity }: { activity: ActivityResponse }) => {
  const currentUser = useClientConnectedUser();

  const formattedCreatedAt = useMemo(() => {
    return formatDistanceToNow(activity.created_at, { addSuffix: true });
  }, [activity.created_at]);

  return (
    <div className="w-full p-2 md:p-4 bg-base-100 md:card md:border border-base-300 border-t-1">
      <div className="w-full flex items-start gap-2 md:gap-4">
        <div className="size-10 md:size-12">
          <Avatar user={activity.user} />
        </div>
        <div className="w-full flex flex-col items-start gap-2 md:gap-4">
          <div className="flex flex-row items-start w-full justify-between gap-2">
            <div className="flex flex-col items-start">
              <span className="font-semibold text-md">
                {activity.user.name}
              </span>
              <span className="text-sm text-base-content/80">
                {formattedCreatedAt}
              </span>
            </div>
            {activity.current_feed?.feed !== `user:${currentUser?.id}` && (
              <ToggleFollowButton
                userId={activity.current_feed!.created_by.id}
              />
            )}
          </div>
          <p className="w-full">{activity.text}</p>
          {activity.attachments.length > 0 && (
            <img
              src={activity.attachments[0].image_url}
              alt="Uploaded image"
              className="w-50 h-50 object-cover rounded-lg"
            />
          )}
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <button type="button" className="btn">
                <NavLink
                  href={`/activity/${activity.id}`}
                  icon="chat"
                  label={activity.comment_count.toString()}
                />
              </button>
              <ToggleReaction activity={activity} />
              <ToggleBookmark activity={activity} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
