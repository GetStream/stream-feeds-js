import { Feed, FeedState } from '@stream-io/feeds-client';
import { useFeedContext } from '../feed-context';
import { useStateStore } from '@stream-io/feeds-client/react-bindings';
import { useErrorContext } from '../error-context';

const selector = ({ own_follows = [] }: FeedState) => {
  // TODO: we need to be able to get this info in queryFeeds result as well
  const own_follow = own_follows.find(
    (_) => _.source_feed.group_id === 'timeline',
  );
  return {
    follow_status: own_follow?.status,
  };
};

export const FollowStatusButton = ({ feed }: { feed: Feed }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();

  const { ownTimeline } = useFeedContext();

  const { follow_status: followStatus } = useStateStore(feed.state, selector);

  const follow = async (feed: Feed) => {
    if (!ownTimeline) return;

    try {
      await ownTimeline.follow(feed);
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const unfollow = async (feed: Feed) => {
    if (!ownTimeline) return;

    try {
      await ownTimeline.unfollow(feed);
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  return (
    <>
      {followStatus === 'pending' && (
        <div className="flex items-center gap-3">
          <div>Follow request is waiting for approval</div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => unfollow(feed)}
          >
            Cancel request
          </button>
        </div>
      )}
      {followStatus === 'accepted' && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => unfollow(feed)}
        >
          Unfollow
        </button>
      )}
      {(!followStatus || followStatus === 'rejected') && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => follow(feed)}
        >
          Follow
        </button>
      )}
    </>
  );
};
