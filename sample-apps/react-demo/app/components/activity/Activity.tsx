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
    <div className="w-full flex flex-col items-start gap-4">
      <ActivityHeader
        activity={activity}
        withFollowButton={location === 'foryou'}
        withLink={location === 'timeline' || location === 'profile' || location === 'search' || location === 'foryou'}
        withActions={location === 'timeline' || location === 'profile'}
      />
      <ActivityContent activity={activity} withoutLinks={location === 'preview'} />
      {activity?.parent ? (location === 'preview' ? <ActivityParent activity={activity} /> : <NavLink className="w-full min-w-0 max-w-full" href={`/activity/${activity.parent?.id}`}><ActivityParent activity={activity} /></NavLink>) : null}
      {location !== 'preview' && <ActivityInteractions activity={activity} />}
    </div>
  );
};
