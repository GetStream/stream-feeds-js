import { useErrorContext } from '@/app/error-context';
import { useFeedContext } from '@/app/feed-context';
import type {
  ActivityResponse,
  AggregatedActivityResponse,
} from '@stream-io/feeds-react-sdk';
import { useState } from 'react';

// TODO: Migrate to new API
export const FollowRequestNotification = ({
  group,
  onMarkRead,
}: {
  group: AggregatedActivityResponse;
  onMarkRead: () => {};
}) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  // activities.length will always be exactly 1
  const [activity] = useState<ActivityResponse>(group.activities[0]);
  const [isPending, setIsPending] = useState<boolean>(true);
  const { ownFeed } = useFeedContext();

  const accept = async (activity: ActivityResponse) => {
    // try {
    //   await ownFeed?.update({
    //     accepted_follow_requests: [`timeline:${activity.user.id}`],
    //   });
    //   // reload state because we don't yet have WS events
    //   await ownFeed?.getOrCreate().catch((err) => logError(err));
    //   onMarkRead();
    // } catch (error) {
    //   logErrorAndDisplayNotification(error as Error, (error as Error).message);
    // }
  };

  const decline = async (activity: ActivityResponse) => {
    try {
      // await ownFeed?.update({
      //   rejected_follow_requests: [`timeline:${activity.user.id}`],
      // });
      // reload state because we don't yet have WS events
      onMarkRead();
      await ownFeed?.getOrCreate();
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  return (
    <div className="w-full flex items-center justify-between">
      {activity.user?.name} wants to follow you
      <div className="flex items-center gap-1">
        {!group && <div className="rounded-full bg-blue-500 w-2 h-2"></div>}
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
      </div>
    </div>
  );
};
