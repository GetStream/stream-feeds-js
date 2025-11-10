import { ActivityResponse } from '@stream-io/feeds-react-sdk';
import Link from 'next/link';

export const ActivityMetadata = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  return (
    <>
      <Link href={'/users/' + activity.user.id}>
        <img className="w-16 rounded-full" src={activity.user.image} alt="" />
      </Link>
      <div className="max-w-full w-full min-w-0">
        <Link href={'/users/' + activity.user.id}>
          <b>{activity.user.name}</b>
        </Link>
        <div className="text-sm text-gray-700 flex items-center gap-1">
          <div>{activity.created_at.toLocaleString()}</div>
          {activity.edited_at && (
            <div>
              - edited at {new Date(activity.edited_at).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
