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
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <OpenComments activity={activity} />
        <ToggleReaction activity={activity} />
        <ReplyToActivity activity={activity} />
        <ToggleBookmark activity={activity} />
      </div>
    </div>
  );
};
