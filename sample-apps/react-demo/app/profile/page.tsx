'use client';

import type { FeedState } from '@stream-io/feeds-react-sdk';
import {
  useClientConnectedUser,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useOwnFeedsContext } from '../own-feeds-context';
import { Avatar } from '../components/utility/Avatar';

const userFeedSelector = (state: FeedState) => ({
  // Don't count your own timeline in following feeds
  followerCount: (state.follower_count ?? 1) - 1,
  activityCount: state.activity_count ?? 0,
});

const timelineFeedSelector = (state: FeedState) => ({
  // Don't count yourself as a follower
  followingCount: (state.following_count ?? 1) - 1,
});

export default function Profile() {
  const currentUser = useClientConnectedUser();
  const { ownFeed, ownTimeline } = useOwnFeedsContext();

  const { followerCount, activityCount } = useStateStore(
    ownFeed?.state,
    userFeedSelector,
  ) ?? {
    followerCount: 0,
    activityCount: 0,
  };
  const { followingCount } = useStateStore(
    ownTimeline?.state,
    timelineFeedSelector,
  ) ?? {
    followingCount: 0,
  };

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <div className="flex flex-row items-center justify-center gap-4">
        <div className="size-10 md:size-12">
          <Avatar user={currentUser} />
        </div>
        <div className="text-lg font-semibold">{currentUser?.name}</div>
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
    </div>
  );
}
