import type { Feed, FeedState } from '@stream-io/feeds-react-sdk';
import { useStateStore } from '@stream-io/feeds-react-sdk';
import { useErrorContext } from '../error-context';
import { useOwnFeedsContext } from '../own-feeds-context';

const selector = ({ own_follows = [] }: FeedState) => {
  const own_follow = own_follows.find(
    (_) => _.source_feed.group_id === 'timeline',
  );
  return {
    follow_status: own_follow?.status,
  };
};

export const FollowStatusButton = ({ feed }: { feed: Feed }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();

  const { ownTimeline } = useOwnFeedsContext();

  const { follow_status: followStatus } = useStateStore(feed.state, selector);

  const follow = async () => {
    if (!ownTimeline) return;

    try {
      await ownTimeline.follow(feed, {
        create_notification_activity: true,
      });
    } catch (error) {
      logErrorAndDisplayNotification(error);
    }
  };

  const unfollow = async () => {
    if (!ownTimeline) return;

    try {
      await ownTimeline.unfollow(feed);
    } catch (error) {
      logErrorAndDisplayNotification(error);
    }
  };

  return (
    <>
      {followStatus === 'pending' && (
        <div className="flex items-center gap-3">
          <div>Follow request is waiting for approval</div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => unfollow()}
          >
            Cancel request
          </button>
        </div>
      )}
      {followStatus === 'accepted' && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => unfollow()}
        >
          Unfollow
        </button>
      )}
      {(!followStatus || followStatus === 'rejected') && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => follow()}
        >
          Follow
        </button>
      )}
    </>
  );
};
