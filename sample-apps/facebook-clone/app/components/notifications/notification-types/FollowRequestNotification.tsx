import { useFeedContext } from '@/app/feed-context';
import { Activity, AggregatedActivities } from '@stream-io/feeds-client';
import { useState } from 'react';

export const FollowRequestNotification = ({
  group,
  onMarkRead,
}: {
  group: AggregatedActivities;
  onMarkRead: () => {};
}) => {
  // Follow requests are grouped by id so activities.length will always be exactly 1
  const [activity] = useState<Activity>(group.activities[0]);
  const { ownFeed } = useFeedContext();

  const accept = (activity: Activity) => {
    void ownFeed?.update({
      accepted_follow_requests: [`timeline:${activity.user.id}`],
    });
    // TODO: update activity here
    onMarkRead();
  };

  const decline = (activity: Activity) => {
    void ownFeed?.update({
      rejected_follow_requests: [`timeline:${activity.user.id}`],
    });
    // TODO: update activity here
    onMarkRead();
  };

  return (
    <div className="w-full flex items-center justify-between">
      {activity.user?.name} wants to follow you
      <div className="flex items-center gap-1">
        {!activity.custom?.state && (
          <>
            <button
              className="w-max flex px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              onClick={() => accept(activity)}
            >
              <span className="material-symbols-outlined">check</span>
            </button>
            <button
              className="w-max flex px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              onClick={() => decline(activity)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </>
        )}
        {activity.custom?.state && <div>{activity.custom?.state}</div>}
        {!group.read && (
          <div className="rounded-full bg-blue-500 w-2 h-2"></div>
        )}
      </div>
    </div>
  );
};
