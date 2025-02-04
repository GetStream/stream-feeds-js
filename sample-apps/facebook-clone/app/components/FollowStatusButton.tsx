import { StreamFeedClient } from '@stream-io/feeds-client';
import { useErrorContext } from '../error-context';
import { useFeedContext } from '../feed-context';
import { FollowStatus } from '../types';
import Link from 'next/link';

export const FollowStatusButton = ({
  status,
  onStatusChange,
  feed,
}: {
  status: FollowStatus;
  onStatusChange: (status: FollowStatus) => void;
  feed: StreamFeedClient;
}) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  const { ownTimeline } = useFeedContext();

  const follow = async (feed: StreamFeedClient) => {
    const visibilityLevel = feed.state.getLatestValue().visibility_level;
    try {
      const followResponse = await ownTimeline?.follow({
        target_group: feed.group,
        target_id: feed.id,
      });
      fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: feed.id,
          verb: visibilityLevel === 'visible' ? 'follow' : `follow-request`,
          objectId: feed.fid,
        }),
      }).catch((err) => logError(err));
      // Reinit state to include activities from newly followed user
      await ownTimeline
        ?.read({ limit: 30, offset: 0 })
        .catch((err) => logError(err));
      onStatusChange(
        followResponse?.follow_request_status === 'pending'
          ? 'follow-request-sent'
          : 'following',
      );
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const unfollow = async (feed: StreamFeedClient) => {
    try {
      await ownTimeline?.unfollow({
        target_group: feed.group,
        target_id: feed.id,
      });
      // Reinit state to exclude activities from newly unfollowed user
      await ownTimeline
        ?.read({ limit: 30, offset: 0 })
        .catch((err) => logError(err));
      onStatusChange('not-followed');
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const cancelFollowRequest = async (feed: StreamFeedClient) => {
    try {
      await ownTimeline?.update({
        cancelled_pending_follow_requests: [feed.fid],
      });
      onStatusChange('not-followed');
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  return (
    <>
      {status === 'follow-request-sent' && (
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
      {status === 'needs-invite' && (
        <div className="text-gray-700">You need an invite to follow</div>
      )}
      {status === 'invited' && (
        <Link
          href="/my-notifications"
          className="text-blue-500 underline hover:no-underline"
        >
          Accept your invite to follow
        </Link>
      )}
      {status === 'following' && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => unfollow(feed)}
        >
          Unfollow
        </button>
      )}
      {status === 'not-followed' && (
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
