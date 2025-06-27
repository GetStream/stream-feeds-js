import { useErrorContext } from '@/app/error-context';
import { useFeedContext } from '@/app/feed-context';
import {
  ActivityResponse,
  AggregatedActivityResponse,
  FollowResponse,
} from '@stream-io/feeds-client';
import { useState } from 'react';

// TODO: Migrate to new API
export const FollowInviteNotification = ({
  group,
  onMarkRead,
  followRequest,
}: {
  group: AggregatedActivityResponse;
  followRequest: FollowResponse;
  onMarkRead: () => {};
}) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  // activities.length will always be exactly 1
  const [activity] = useState<ActivityResponse>(group.activities[0]);
  const [isPending, setIsPending] = useState<boolean>(true);
  const { ownTimeline } = useFeedContext();

  const accept = async (activity: ActivityResponse) => {
    // try {
    //   const feedFid = activity.object.split(':');
    //   await ownTimeline?.follow({
    //     target_group: feedFid[0],
    //     target_id: feedFid[1],
    //   });
    //   // reload state because we don't yet have WS events
    //   await ownTimeline?.getOrCreate().catch((err) => logError(err));
    //   onMarkRead();
    //   // Reinit state to include activities from newly followed user
    //   await ownTimeline
    //     ?.read({ limit: 30, offset: 0 })
    //     .catch((err) => logError(err));
    // } catch (error) {
    //   logErrorAndDisplayNotification(error as Error, (error as Error).message);
    // }
  };

  const decline = async (_: ActivityResponse) => {
    alert(`We don't yet have an API to decline an invite`);
    onMarkRead();
  };

  return (
    <div className="w-full flex items-center justify-between">
      {activity.user?.name} invited you to follow
      <div className="flex items-center gap-1">
        {!group && <div className="rounded-full bg-blue-500 w-2 h-2"></div>}
        {!activity.custom?.state && (
          <>
            <button
              className="w-max flex px-1 py-0.5 bg-blue-600 text-white rounded-md disabled:bg-blue-100 hover:bg-blue-700 focus:outline-none"
              onClick={() => accept(activity)}
              disabled={!isPending}
            >
              <span className="material-symbols-outlined">check</span>
            </button>
            <button
              className="w-max flex px-1 py-0.5 bg-blue-600 text-white rounded-md disabled:bg-blue-100 hover:bg-blue-700 focus:outline-none"
              onClick={() => decline(activity)}
              disabled={!isPending}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </>
        )}
        {activity.custom?.state && <div>{activity.custom?.state}</div>}
      </div>
    </div>
  );
};
