import { type ActivityResponse } from '@stream-io/feeds-react-sdk';
import { ActivityHeader } from './ActivityHeader';
import { ActivityInteractions } from './activity-interactions/ActivityInteractions';
import { ActivityContent } from './ActivityContent';
import { ActivityParent } from './ActivityParent';
import { NavLink } from '../utility/NavLink';
import { Avatar } from '../utility/Avatar';
import { PollDisplay } from '../poll/PollDisplay';

export const Activity = ({
  activity,
  location,
}: {
  activity: ActivityResponse;
  location: 'timeline' | 'profile' | 'foryou' | 'preview' | 'search';
}) => {
  const isHashtagFeed = activity.current_feed?.group_id === 'hashtag';
  const hashtagId = activity.current_feed?.id;
  const withLink = location === 'timeline' || location === 'profile' || location === 'search' || location === 'foryou';

  return (
    <article className="w-full flex gap-3">
      <div className="flex-shrink-0">
        {withLink ? (
          <NavLink href={`/profile/${activity.user.id}`}>
            <Avatar user={activity.user} className="size-10" />
          </NavLink>
        ) : (
          <Avatar user={activity.user} className="size-10" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {isHashtagFeed && hashtagId && (
          location === 'preview' ? (
            <div className="flex items-center gap-2">
              <div className="size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                #
              </div>
              <span className="text-xs text-base-content/70">
                #{hashtagId}
              </span>
            </div>
          ) : (
            <NavLink
              href={`/hashtag/${hashtagId}`}
              className="flex items-center gap-2 group"
            >
              <div className="size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                #
              </div>
              <span className="text-xs text-base-content/70 group-hover:underline">
                #{hashtagId}
              </span>
            </NavLink>
          )
        )}
        <ActivityHeader
          activity={activity}
          withFollowButton={location === 'foryou'}
          withLink={withLink}
          withActions={location === 'timeline' || location === 'profile'}
          withAvatar={false}
        />
        <ActivityContent activity={activity} withoutInteractions={location === 'preview'} />
        {activity.poll && (
          <PollDisplay
            poll={activity.poll}
            activity={activity}
            withoutInteractions={location === 'preview'}
          />
        )}
        {activity?.parent ? (
          location === 'preview' ? (
            <ActivityParent activity={activity} />
          ) : (
            <NavLink className="w-full min-w-0 max-w-full block" href={`/activity/${activity.parent?.id}`}>
              <ActivityParent activity={activity} />
            </NavLink>
          )
        ) : null}
        {location !== 'preview' && (
          <ActivityInteractions activity={activity} />
        )}
      </div>
    </article>
  );
};
