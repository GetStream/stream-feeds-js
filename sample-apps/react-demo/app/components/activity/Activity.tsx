import { type ActivityResponse } from '@stream-io/feeds-react-sdk';
import { ActivityHeader } from './ActivityHeader';
import { ActivityInteractions } from './activity-interactions/ActivityInteractions';
import { ActivityContent } from './ActivityContent';
import { ActivityParent } from './ActivityParent';
import { NavLink } from '../utility/NavLink';

export const Activity = ({
  activity,
  location,
}: {
  activity: ActivityResponse;
  location: 'timeline' | 'profile' | 'foryou' | 'preview' | 'search';
}) => {

  return (
    <article className="w-full flex flex-col gap-1">
      <ActivityHeader
        activity={activity}
        withFollowButton={location === 'foryou'}
        withLink={location === 'timeline' || location === 'profile' || location === 'search' || location === 'foryou'}
        withActions={location === 'timeline' || location === 'profile'}
      />
      <ActivityContent activity={activity} withoutInteractions={location === 'preview'} />
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
