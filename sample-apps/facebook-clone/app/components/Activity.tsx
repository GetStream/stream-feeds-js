import { Activity as StreamActivity } from '@stream-io/feeds-client';

export const Activity = ({ activity }: { activity: StreamActivity }) => {
  return (
    <>
      <div className="w-full p-3 border border-gray-300 rounded-md">
        <div className="flex items-center pb-3 gap-1">
          <img
            className="size-10 rounded-full"
            src={activity.user.image}
            alt=""
          />
          <div>
            <b>{activity.created_at.toLocaleString()}</b>
          </div>
        </div>
        <div>{activity.custom?.text}</div>
      </div>
    </>
  );
};
