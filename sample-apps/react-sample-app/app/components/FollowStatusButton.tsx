import { Feed } from '@stream-io/feeds-client';
import { useErrorContext } from '../error-context';
import { useFeedContext } from '../feed-context';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const FollowStatusButton = ({ feed }: { feed: Feed }) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  const { ownTimeline } = useFeedContext();
  const [followStatus, setFollowStatus] = useState<
    'rejected' | 'accepted' | 'pending'
  >();

  const follow = async (feed: Feed) => {
    useEffect(() => {
      const unsubscribe = feed.state.subscribeWithSelector(
        (s) => ({
          followStatus: s.own_follows?.[0]?.status,
        }),
        (s) => {
          setFollowStatus(
            s.followStatus as 'rejected' | 'accepted' | 'pending',
          );
        },
      );

      return unsubscribe;
    }, [feed]);
    // const visibilityLevel = feed.state.getLatestValue().visibility_level;
    // try {
    //   const followResponse = await ownTimeline?.follow({
    //     target_group: feed.group,
    //     target_id: feed.id,
    //   });
    //   fetch('/api/send-notification', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       targetUserId: feed.id,
    //       verb: visibilityLevel === 'visible' ? 'follow' : `follow-request`,
    //       objectId: feed.fid,
    //     }),
    //   }).catch((err) => logError(err));
    //   // Reinit state to include activities from newly followed user
    //   await ownTimeline
    //     ?.read({ limit: 30, offset: 0 })
    //     .catch((err) => logError(err));
    //   onStatusChange(
    //     followResponse?.follow_request_status === 'pending'
    //       ? 'follow-request-sent'
    //       : 'following',
    //   );
    // } catch (error) {
    //   logErrorAndDisplayNotification(error as Error, (error as Error).message);
    // }
  };

  const unfollow = async (feed: Feed) => {
    // try {
    //   await ownTimeline?.unfollow({
    //     target_group: feed.group,
    //     target_id: feed.id,
    //   });
    //   // Reinit state to exclude activities from newly unfollowed user
    //   await ownTimeline
    //     ?.read({ limit: 30, offset: 0 })
    //     .catch((err) => logError(err));
    //   onStatusChange('not-followed');
    // } catch (error) {
    //   logErrorAndDisplayNotification(error as Error, (error as Error).message);
    // }
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
