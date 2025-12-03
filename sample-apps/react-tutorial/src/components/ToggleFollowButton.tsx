import { useCallback, useState } from 'react';
import { useOwnFeedsContext } from '../own-feeds-context';

export const ToggleFollowButton = ({
  userId,
  isFollowing: initialIsFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) => {
  const { ownTimeline, ownStoryTimeline } = useOwnFeedsContext();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const follow = useCallback(async () => {
    await ownTimeline
      ?.follow(`user:${userId}`, {
        create_notification_activity: true,
      })
      .catch((e) => {
        // Tutorial users don't have notification feed, so we ignore the error
        if (
          e instanceof Error &&
          !e.message.includes(`notification:${userId}`)
        ) {
          throw e;
        }
      });
    await ownStoryTimeline
      ?.follow(`story:${userId}`)
      // Tutorial users don't have stories feed, so we ignore the error
      .catch((e) => {
        if (e instanceof Error && !e.message.includes(`story:${userId}`)) {
          throw e;
        }
      });
    setIsFollowing(true);
    // Reload timelines to see new activities
    await ownTimeline?.getOrCreate({ watch: true });
    await ownStoryTimeline?.getOrCreate({ watch: true });
  }, [userId, ownTimeline, ownStoryTimeline]);

  const unfollow = useCallback(async () => {
    await ownTimeline?.unfollow(`user:${userId}`);
    await ownStoryTimeline?.unfollow(`story:${userId}`).catch((e) => {
      if (e instanceof Error && !e.message.includes(`story:${userId}`)) {
        throw e;
      }
    });
    setIsFollowing(false);
    // Reload timelines to remove activities
    await ownTimeline?.getOrCreate({ watch: true });
    await ownStoryTimeline?.getOrCreate({ watch: true });
  }, [userId, ownTimeline, ownStoryTimeline]);

  const toggleFollow = useCallback(() => {
    if (isFollowing) {
      unfollow();
    } else {
      follow();
    }
  }, [isFollowing, follow, unfollow]);

  return (
    <button
      className={`btn btn-soft ${
        isFollowing ? 'btn-error' : 'btn-primary'
      } btn-sm`}
      onClick={toggleFollow}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};
