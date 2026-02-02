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
    <div className="w-full max-w-md">
      <div className="flex flex-row items-center justify-between">
        <OpenComments activity={activity} />
        <ReplyToActivity activity={activity} />
        <ToggleReaction activity={activity} />
        <ToggleBookmark activity={activity} />
      </div>
    </div>
  );
};
