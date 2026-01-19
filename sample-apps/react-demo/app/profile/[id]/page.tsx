'use client';

import type { Feed, FeedState } from '@stream-io/feeds-react-sdk';
import {
  StreamFeed,
  useClientConnectedUser,
  useFeedsClient,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useOwnFeedsContext } from '../../own-feeds-context';
import { Avatar } from '../../components/utility/Avatar';
import { NavLink } from '../../components/utility/NavLink';
import { ActivityList } from '../../components/activity/ActivityList';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const userFeedSelector = (state: FeedState) => ({
  // Don't count your own timeline in following feeds
  followerCount: (state.follower_count ?? 1) - 1,
  activityCount: state.activity_count ?? 0,
  user: state.created_by,
});

const timelineFeedSelector = (state: FeedState) => ({
  // Don't count yourself as a follower
  followingCount: (state.following_count ?? 1) - 1,
});

export default function Profile() {
  const userId = useParams<{ id: string }>().id;
  const currentUser = useClientConnectedUser();
  const client = useFeedsClient();
  const { ownFeed, ownTimeline } = useOwnFeedsContext();
  const [feed, setFeed] = useState<Feed | undefined>();
  const [timeline, setTimeline] = useState<Feed | undefined>();

  useEffect(() => {
    if (!userId || !client || !currentUser?.id) {
      setFeed(undefined);
      setTimeline(undefined);
      return;
    }
    if (userId === currentUser?.id) {
      setFeed(ownFeed);
      setTimeline(ownTimeline);
    } else {
      const _feed = client.feed('user', userId);
      const _timeline = client.feed('timeline', userId);
      _feed.getOrCreate();
      _timeline.getOrCreate();
      setFeed(_feed);
      setTimeline(_timeline);
    }
  }, [userId, currentUser?.id, client, ownFeed, ownTimeline]);

  const { followerCount, activityCount, user } = useStateStore(
    feed?.state,
    userFeedSelector,
  ) ?? {
    followerCount: 0,
    activityCount: 0,
  };
  const { followingCount } = useStateStore(
    timeline?.state,
    timelineFeedSelector,
  ) ?? {
    followingCount: 0,
  };

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <div className="flex flex-row items-center justify-center gap-4">
        <Avatar user={user} className="size-10 md:size-12" />
        <div className="text-lg font-semibold">{user?.name}</div>
      </div>
      <div className="stats">
        <div className="stat">
          <div className="stat-title">Posts</div>
          <div className="stat-value text-primary">{activityCount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Followers</div>
          <div className="stat-value text-primary">{followerCount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Following</div>
          <div className="stat-value text-primary">{followingCount}</div>
        </div>
      </div>
      <div className="md:hidden">
        <NavLink className="w-full h-full flex flex-row items-center justify-stretch gap-2 min-w-0" href="/bookmarks">
          <span className="material-symbols-outlined">bookmark</span>
          <span className="text-sm">Bookmarks</span>
        </NavLink>
      </div>
      {feed && (
        <StreamFeed feed={feed}>
          <ActivityList location="profile" />
        </StreamFeed>
      )}
    </div>
  );
}
