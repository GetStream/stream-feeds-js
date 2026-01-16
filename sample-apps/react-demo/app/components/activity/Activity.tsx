import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { ActivityHeader } from './ActivityHeader';
import { ActivityContent } from './ActivityContent';
import { ActivityActions } from './activity-actions/ActivityActions';

export const Activity = ({
  activity,
  withFollowButton = false,
  withActions = true,
}: {
  activity: ActivityResponse;
  withFollowButton?: boolean;
  withActions?: boolean;
}) => {
  return (
    <div className="w-full p-2 md:p-4 bg-base-100 md:card md:border border-base-300 border-t-1">
      <div className="w-full flex flex-col items-start gap-4">
        <ActivityHeader
          activity={activity}
          withFollowButton={withFollowButton}
        />
        <ActivityContent activity={activity} />
        {withActions && <ActivityActions activity={activity} />}
      </div>
    </div>
  );
};
