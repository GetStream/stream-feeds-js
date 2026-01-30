import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { NavLink } from '../utility/NavLink';
import { Activity } from './Activity';

export const ActivityPreview = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  return (
    <NavLink className="w-full" href={`/activity/${activity.id}`}>
      <Activity activity={activity} location="preview" />
    </NavLink>
  );
};
