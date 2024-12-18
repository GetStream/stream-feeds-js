import { Activity as StreamActivity } from '@stream-io/feeds-client';
import { Reactions } from './reactions/Reactions';

export const Activity = ({ activity }: { activity: StreamActivity }) => {
  return (
    <>
      <div className="w-full p-3 border border-gray-300 gap-3 flex flex-col rounded-md">
        <div className="flex items-center gap-1">
          <img
            className="size-12 rounded-full"
            src={activity.user.image}
            alt=""
          />
          <div>
            <b>{activity.user.name}</b>
            <div className="text-sm text-gray-700">
              {activity.created_at.toLocaleString()}
            </div>
          </div>
        </div>
        <div>{activity.custom?.text}</div>
        <Reactions type="like" activity={activity} />
      </div>
    </>
  );
};
