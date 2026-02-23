'use client';

import type { Feed, FeedState } from '@stream-io/feeds-react-sdk';
import {
  StreamFeed,
  useClientConnectedUser,
  useFeedActivities,
  useFeedsClient,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useOwnFeedsContext } from '../../own-feeds-context';
import { Avatar } from '../../components/utility/Avatar';
import { NavLink } from '../../components/utility/NavLink';
import { ActivityList } from '../../components/activity/ActivityList';
import { ProfilePageSkeleton } from '../../components/utility/loading-skeletons/ProfilePageSkeleton';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ToggleFollowButton } from '@/app/components/ToggleFollowButton';
import { TogglePremiumMembershipButton } from '@/app/components/TogglePremiumMembershipButton';
import { FollowListModal, type FollowListModalHandle } from '@/app/components/FollowListModal';
import { MembersListModal, type MembersListModalHandle } from '@/app/components/MembersListModal';

const userFeedSelector = (state: FeedState) => ({
  // Don't count your own timeline in following feeds
  followerCount: (state.follower_count ?? 1) - 1,
  activityCount: state.activity_count ?? 0,
  // Don't count yourself as a member
  memberCount: Math.max((state.member_count ?? 0) - 1, 0),
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
  const { ownFeed, ownTimeline, errors } = useOwnFeedsContext();
  const [feed, setFeed] = useState<Feed | undefined>();
  const [timeline, setTimeline] = useState<Feed | undefined>();
  const [error, setError] = useState<Error | undefined>(undefined);
  const isOwnProfile = userId === currentUser?.id;

  useEffect(() => {
    if (!userId || !client || !currentUser?.id) {
      setFeed(undefined);
      setTimeline(undefined);
      setError(undefined);
      return;
    }
    if (isOwnProfile) {
      setFeed(ownFeed);
      setError(errors?.ownFeed);
      setTimeline(ownTimeline);
    } else {
      const _feed = client.feed('user', userId);
      const _timeline = client.feed('timeline', userId);
      _feed.getOrCreate().catch((e) => {
        setError(e);
        throw e;
      });
      _timeline.getOrCreate();
      setFeed(_feed);
      setTimeline(_timeline);
    }
  }, [userId, currentUser?.id, client, ownFeed, ownTimeline, errors.ownFeed, isOwnProfile]);

  const shouldShowBookmarks = currentUser?.id === userId;

  const shouldShowToggleButtons = currentUser?.id !== userId;

  const { followerCount, activityCount, memberCount, user } = useStateStore(
    feed?.state,
    userFeedSelector,
  ) ?? {
    followerCount: 0,
    activityCount: 0,
    memberCount: 0,
  };
  const { followingCount } = useStateStore(
    timeline?.state,
    timelineFeedSelector,
  ) ?? {
    followingCount: 0,
  };

  const { activities, is_loading: isTimelineLoading } = useFeedActivities(feed);

  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const modalRef = useRef<FollowListModalHandle>(null);
  const membersModalRef = useRef<MembersListModalHandle>(null);

  const openModal = (type: 'followers' | 'following') => {
    setModalType(type);
    modalRef.current?.open();
  };

  const openMembersModal = () => {
    membersModalRef.current?.open();
  };

  const isProfileLoading = userId && !feed || (isTimelineLoading && activities?.length === 0);

  if (isProfileLoading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="w-full flex flex-col items-stretch">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 px-4 py-4 border-b border-base-content/10">
        <div className="flex flex-row items-center gap-3">
          <Avatar user={user} className="size-10" />
          <div className="text-[15px] font-semibold">{user?.name}</div>
        </div>
        <div className="flex flex-row items-center gap-4 text-sm">
          <span><span className="font-semibold">{activityCount}</span> <span className="text-base-content/70">Posts</span></span>
          <button className="hover:underline cursor-pointer" onClick={() => openModal('followers')}>
            <span className="font-semibold">{followerCount}</span> <span className="text-base-content/70">Followers</span>
          </button>
          <button className="hover:underline cursor-pointer" onClick={() => openModal('following')}>
            <span className="font-semibold">{followingCount}</span> <span className="text-base-content/70">Following</span>
          </button>
          <button className="hover:underline cursor-pointer" onClick={openMembersModal}>
            <span className="font-semibold">{memberCount}</span> <span className="text-base-content/70">Members</span>
          </button>
        </div>
        {shouldShowToggleButtons && (
          <div className="flex flex-row items-center gap-2">
            <ToggleFollowButton userId={userId} />
            {feed && <TogglePremiumMembershipButton feed={feed} userId={userId} />}
          </div>
        )}
        {shouldShowBookmarks && (
          <NavLink
            className="lg:hidden flex flex-row items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content transition-colors"
            href="/bookmarks"
          >
            <span className="material-symbols-outlined text-[18px]!">bookmark</span>
            <span>Bookmarks</span>
          </NavLink>
        )}
      </div>

      {/* Feed */}
      {feed && (
        <StreamFeed feed={feed}>
          <ActivityList location="profile" error={error} />
        </StreamFeed>
      )}
      {feed && timeline && (
        <FollowListModal
          ref={modalRef}
          type={modalType}
          feed={modalType === 'followers' ? feed : timeline}
        />
      )}
      {feed && (
        <MembersListModal ref={membersModalRef} feed={feed} />
      )}
    </div>
  );
}
