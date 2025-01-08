import { useErrorContext } from '@/app/error-context';
import { useFeedContext } from '@/app/feed-context';
import { Activity, AggregatedActivities } from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';

export const FollowRequestNotification = ({
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
  const { ownFeed } = useFeedContext();

  useEffect(() => {
    if (!ownFeed) {
      return;
    }
    const unsubscribe = ownFeed.state.subscribeWithSelector(
      (state) => ({ pending: state.follow_requests?.pending }),
      ({ pending }) => {
        setIsPending(
          !!pending?.find(
            (r) => r.source_fid === `timeline:${activity.user.id}`,
          ),
        );
      },
    );

    return unsubscribe;
  }, [ownFeed, activity]);

  const accept = async (activity: Activity) => {
    try {
      await ownFeed?.update({
        accepted_follow_requests: [`timeline:${activity.user.id}`],
      });
      // reload state because we don't yet have WS events
      await ownFeed?.getOrCreate().catch((err) => logError(err));
      onMarkRead();
    } catch (error) {
      logErrorAndDisplayNotification(
        error as Error,
        `Failed to accept invitation, this could've been a temporary issue, try again`,
      );
    }
  };

  const decline = async (activity: Activity) => {
    try {
      await ownFeed?.update({
        rejected_follow_requests: [`timeline:${activity.user.id}`],
      });
      // reload state because we don't yet have WS events
      onMarkRead();
      await ownFeed?.getOrCreate();
    } catch (error) {
      logErrorAndDisplayNotification(
        error as Error,
        `Failed to decline invitation, this could've been a temporary issue, try again`,
      );
    }
  };

  return (
    <div className="w-full flex items-center justify-between">
      {activity.user?.name} wants to follow you
      <div className="flex items-center gap-1">
        {!group.read && (
          <div className="rounded-full bg-blue-500 w-2 h-2"></div>
        )}
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
      </div>
    </div>
  );
};
