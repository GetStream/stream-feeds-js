import { Feed, FeedState } from '@stream-io/feeds-client';
import { useErrorContext } from '../error-context';
import { useFeedContext } from '../feed-context';
import { useStateStore } from '@stream-io/feeds-client/react-bindings';

const selector = ({ own_follows = [] }: FeedState) => {
  const own_follow = own_follows.find(
    (_) => _.source_feed.group_id === 'timeline',
  );
  return {
    follow_status: own_follow?.status,
  };
};

export const FollowStatusButton = ({ feed }: { feed: Feed }) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  const { ownTimeline } = useFeedContext();

  const { follow_status: followStatus } = useStateStore(feed.state, selector);

  const follow = async (feed: Feed) => {
    if (!ownTimeline) return;

    await ownTimeline.follow(feed);
  };

  const unfollow = async (feed: Feed) => {
    if (!ownTimeline) return;

    await ownTimeline.unfollow(feed);
  };

  const cancelFollowRequest = async (feed: Feed) => {
    // try {
    //   await ownTimeline?.update({
    //     cancelled_pending_follow_requests: [feed.fid],
    //   });
    //   onStatusChange('not-followed');
    // } catch (error) {
    //   logErrorAndDisplayNotification(error as Error, (error as Error).message);
    // }
  };

  return (
    <>
      {followStatus === 'pending' && (
        <div className="flex items-center gap-3">
          <div>Follow request is waiting for approval</div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => cancelFollowRequest(feed)}
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
