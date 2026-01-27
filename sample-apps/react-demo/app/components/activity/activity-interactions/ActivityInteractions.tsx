import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { ToggleBookmark } from './ToggleBookmark';
import { ToggleReaction } from './ToggleReaction';
import { OpenComments } from './OpenComments';
import { ReplyToActivity } from './ReplyToActivity';

export const ActivityInteractions = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="flex flex-row flex-wrap gap-2">
        <OpenComments activity={activity} />
        <ToggleReaction activity={activity} />
        <ReplyToActivity activity={activity} />
        <ToggleBookmark activity={activity} />
      </div>
    </div>
  );
};
