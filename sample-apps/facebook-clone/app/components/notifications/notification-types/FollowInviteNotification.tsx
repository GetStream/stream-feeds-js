import { useErrorContext } from '@/app/error-context';
import { useFeedContext } from '@/app/feed-context';
import { Activity, AggregatedActivities } from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';

export const FollowInviteNotification = ({
  group,
  onMarkRead,
}: {
  group: AggregatedActivities;
  onMarkRead: () => {};
}) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  // activities.length will always be exactly 1
  const [activity] = useState<Activity>(group.activities[0]);
  const [isPending, setIsPending] = useState<boolean>(true);
  const { ownTimeline } = useFeedContext();

  useEffect(() => {
    if (!ownTimeline) {
      return;
    }
    const unsubscribe = ownTimeline.state.subscribeWithSelector(
      (state) => ({ invites: state.follow_requests?.invites }),
      ({ invites }) => {
        setIsPending(!!invites?.find((r) => r.target_fid === activity.object));
      },
    );

    return unsubscribe;
  }, [ownTimeline, activity]);

  const accept = async (activity: Activity) => {
    try {
      const feedFid = activity.object.split(':');
      await ownTimeline?.follow({
        target_group: feedFid[0],
        target_id: feedFid[1],
      });
      // reload state because we don't yet have WS events
      await ownTimeline?.getOrCreate().catch((err) => logError(err));
      onMarkRead();
      // Reinit state to include activities from newly followed user
      await ownTimeline
        ?.read({ limit: 30, offset: 0 })
        .catch((err) => logError(err));
    } catch (error) {
      logErrorAndDisplayNotification(
        error as Error,
        `Failed to accept follow request, this could've been a temporary issue, try again`,
      );
    }
  };

  const decline = async (_: Activity) => {
    alert(`We don't yet have an API to decline an invite`);
    onMarkRead();
  };

  return (
    <div className="w-full flex items-center justify-between">
      {activity.user?.name} invited you to follow
      <div className="flex items-center gap-1">
        {!group.read && (
          <div className="rounded-full bg-blue-500 w-2 h-2"></div>
        )}
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
              className="w-max flex px-1 py-0.5 bg-blue-600 text-white rounded-md rounded-md disabled:bg-blue-100 hover:bg-blue-700 focus:outline-none"
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
