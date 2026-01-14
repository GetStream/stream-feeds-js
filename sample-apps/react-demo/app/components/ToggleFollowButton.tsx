import { useCallback } from 'react';
import { useOwnFeedsContext } from '../own-feeds-context';
import { useFeedsClient, useOwnFollows } from '@stream-io/feeds-react-sdk';

export const ToggleFollowButton = ({ userId }: { userId: string }) => {
  const client = useFeedsClient();
  const { ownTimeline, ownStoryTimeline } = useOwnFeedsContext();

  const targetUserFeed = client?.feed('user', userId);

  const targetStoryFeed = client?.feed('story', userId);

  const { own_follows: ownFollows } = useOwnFollows(targetUserFeed) ?? {};

  const isFollowing = (ownFollows?.length ?? 0) > 0;

  const follow = useCallback(async () => {
    if (!targetUserFeed || !targetStoryFeed) {
      return;
    }

    await ownTimeline?.follow(targetUserFeed, {
      // create_notification_activity: true,
    });
    await ownStoryTimeline
      ?.follow(targetStoryFeed)
      // Tutorial users don't have stories feed, so we ignore the error
      .catch((e) => {
        if (e instanceof Error && !e.message.includes(`story:`)) {
          throw e;
        }
      });
    // Reload timelines to see new activities
    await ownTimeline?.getOrCreate({ watch: true, limit: 10 });
    await ownStoryTimeline?.getOrCreate({ watch: true });
  }, [targetUserFeed, targetStoryFeed, ownTimeline, ownStoryTimeline]);

  const unfollow = useCallback(async () => {
    if (!targetUserFeed || !targetStoryFeed) {
      return;
    }

    await ownTimeline?.unfollow(targetUserFeed);
    await ownStoryTimeline?.unfollow(targetStoryFeed).catch((e) => {
      if (e instanceof Error && !e.message.includes(`story:`)) {
        throw e;
      }
    });
    // Reload timelines to remove activities
    await ownTimeline?.getOrCreate({ watch: true });
    await ownStoryTimeline?.getOrCreate({ watch: true });
  }, [targetUserFeed, targetStoryFeed, ownTimeline, ownStoryTimeline]);

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
