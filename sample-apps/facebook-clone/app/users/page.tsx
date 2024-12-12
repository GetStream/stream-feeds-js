'use client';
import { useEffect, useState } from 'react';
import { useUserContext } from '../user-context';
import { useFeedContext } from '../feed-context';
import {
  StreamFlatFeedClient,
  StreamNotificationFeedClient,
} from '@stream-io/feeds-client';
import { LoadingIndicator } from '../components/LoadingIndicator';

type FeedCid = string;

type FollowStatus = 'following' | 'follow-request-sent' | 'not-followed';

type FeedFollowerMapping = Record<FeedCid, FollowStatus>;

export default function Users() {
  const { client, user } = useUserContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [next, setNext] = useState<string | undefined>(undefined);
  const [feeds, setFeeds] = useState<
    (StreamFlatFeedClient | StreamNotificationFeedClient)[]
  >([]);
  const { ownTimeline } = useFeedContext();
  const [followerMapping, setFollowerMapping] = useState<FeedFollowerMapping>(
    {},
  );

  useEffect(() => {
    if (!client || !user || !ownTimeline) {
      return;
    }
    setFollowerMapping({});
    loadMore();
  }, [client, user, ownTimeline]);

  const follow = async (
    feed: StreamFlatFeedClient | StreamNotificationFeedClient,
  ) => {
    const visibilityLevel = feed.state.getLatestValue().visibility_level;
    await ownTimeline?.follow({
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
        verb: visibilityLevel === 'visible' ? 'follow' : 'follow-request',
        objectId: feed.fid,
      }),
    }).catch((err) => console.warn(err));
    // Reinit state to include activities from newly followed user
    await ownTimeline?.read({ limit: 30, offset: 0 });
    setFollowerMapping({
      ...followerMapping,
      [feed.fid]:
        visibilityLevel === 'visible' ? 'following' : 'follow-request-sent',
    });
  };

  const unfollow = async (
    feed: StreamFlatFeedClient | StreamNotificationFeedClient,
  ) => {
    await ownTimeline?.unfollow({
      target_group: feed.group,
      target_id: feed.id,
    });
    // Reinit state to exclude activities from newly unfollowed user
    await ownTimeline?.read({ limit: 30, offset: 0 });
    setFollowerMapping({ ...followerMapping, [feed.fid]: 'not-followed' });
  };

  const loadMore = async () => {
    if (!client || !user || !ownTimeline) {
      return;
    }
    setIsLoading(true);
    const limit = 30;
    const response = await client.queryFeeds({
      limit,
      filter: {
        feed_group: 'user',
      },
      next,
    });
    const newFeeds = response.feeds.filter((f) => f.id !== user.id);
    const followedNewFeeds = (
      await ownTimeline.getFollowedFeeds({
        offset: 0,
        limit,
        filter: newFeeds.map((f) => f.fid),
      })
    ).followed_feeds.map((r) => r.feed);
    newFeeds.forEach((feed) => {
      followerMapping[feed.fid] = followedNewFeeds.find(
        (f) => `${f.group}:${f.id}` === feed.fid,
      )
        ? 'following'
        : 'not-followed';
      if (feed.state.getLatestValue().visibility_level === 'followers') {
        if (
          feed.state
            .getLatestValue()
            .follow_requests?.pending?.find(
              (r) => r.source_fid === ownTimeline.fid,
            )
        ) {
          followerMapping[feed.fid] = 'follow-request-sent';
        }
      }
    });
    setFeeds([...feeds, ...newFeeds]);
    setFollowerMapping({ ...followerMapping });
    setNext(response.next);
    setIsLoading(false);
  };

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center">Users</h2>
      {isLoading && feeds.length === 0 && (
        <LoadingIndicator color="blue"></LoadingIndicator>
      )}
      <ul className="divide-y divide-gray-200">
        {feeds.map((feed) => (
          <li
            key={feed.id}
            className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
          >
            <div className="flex flex-row items-center gap-1">
              <img
                className="size-10 rounded-full"
                src={feed.state.getLatestValue().created_by?.image}
                alt=""
              />
              <p className="text-sm font-medium text-gray-900">
                {feed.state.getLatestValue().created_by?.name}
              </p>
            </div>
            {followerMapping[feed.fid] === 'follow-request-sent' ? (
              'Follow request is waiting for approval'
            ) : (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                onClick={() =>
                  followerMapping[feed.fid] === 'following'
                    ? unfollow(feed)
                    : follow(feed)
                }
              >
                {followerMapping[feed.fid] === 'following'
                  ? 'Unfollow'
                  : 'Follow'}
              </button>
            )}
          </li>
        ))}
      </ul>
      {feeds.length > 0 && next && (
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => loadMore()}
        >
          {isLoading ? <LoadingIndicator></LoadingIndicator> : 'Load more'}
        </button>
      )}
    </div>
  );
}
