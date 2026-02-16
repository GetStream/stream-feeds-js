import { type ActivityResponse } from '@stream-io/feeds-react-sdk';
import { ActivityHeader } from './ActivityHeader';
import { ActivityInteractions } from './activity-interactions/ActivityInteractions';
import { ActivityContent } from './ActivityContent';
import { ActivityParent } from './ActivityParent';
import { NavLink } from '../utility/NavLink';
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

  return (
    <article className="w-full flex flex-col gap-1">
      {isHashtagFeed && hashtagId && (
        location === 'preview' ? (
          <div className="flex items-center gap-2 mb-1">
            <div className="size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
              #
            </div>
            <span className="text-xs text-base-content/50">
              #{hashtagId}
            </span>
          </div>
        ) : (
          <NavLink
            href={`/hashtag/${hashtagId}`}
            className="flex items-center gap-2 mb-1 group"
          >
            <div className="size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
              #
            </div>
            <span className="text-xs text-base-content/50 group-hover:underline">
              #{hashtagId}
            </span>
          </NavLink>
        )
      )}
      <ActivityHeader
        activity={activity}
        withFollowButton={location === 'foryou'}
        withLink={location === 'timeline' || location === 'profile' || location === 'search' || location === 'foryou'}
        withActions={location === 'timeline' || location === 'profile'}
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
          <NavLink className="w-full min-w-0 max-w-full block mt-2" href={`/activity/${activity.parent?.id}`}>
            <ActivityParent activity={activity} />
          </NavLink>
        )
      ) : null}
      {location !== 'preview' && (
        <div className="mt-3">
          <ActivityInteractions activity={activity} />
        </div>
      )}
    </article>
  );
};
