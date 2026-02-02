import { useCallback, useState } from 'react';
import { useOwnFeedsContext } from '../own-feeds-context';
import { useFeedsClient, useOwnFollows } from '@stream-io/feeds-react-sdk';
import { ErrorToast } from './utility/ErrorToast';

export const ToggleFollowButton = ({ userId }: { userId: string }) => {
  const client = useFeedsClient();
  const { ownTimeline, ownStoryTimeline, reloadTimelines } = useOwnFeedsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const targetUserFeed = client?.feed('user', userId);

  const targetStoryFeed = client?.feed('story', userId);

  const { own_follows: ownFollows } = useOwnFollows(targetUserFeed) ?? {};

  const isFollowing = (ownFollows?.length ?? 0) > 0;

  const follow = useCallback(async () => {
    if (!targetUserFeed || !targetStoryFeed) {
      return;
    }

    await ownTimeline?.follow(targetUserFeed, {
      create_notification_activity: true,
    });
    await ownStoryTimeline
      ?.follow(targetStoryFeed)
      // Tutorial users don't have stories feed, so we ignore the error
      .catch((e) => {
        if (e instanceof Error && !e.message.includes(`story:`)) {
          throw e;
        }
      });
    await reloadTimelines();
  }, [targetUserFeed, targetStoryFeed, ownTimeline, ownStoryTimeline, reloadTimelines]);

  const unfollow = useCallback(async () => {
    if (!targetUserFeed || !targetStoryFeed) {
      return;
    }

    await ownTimeline?.unfollow(targetUserFeed, { delete_notification_activity: true });
    await ownStoryTimeline?.unfollow(targetStoryFeed).catch((e) => {
      if (e instanceof Error && !e.message.includes(`story:`)) {
        throw e;
      }
    });
    await reloadTimelines();
  }, [targetUserFeed, targetStoryFeed, ownTimeline, ownStoryTimeline, reloadTimelines]);

  const toggleFollow = useCallback(async () => {
    if (isLoading) return;
    setError(undefined);
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollow();
      } else {
        await follow();
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Something went wrong. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [isFollowing, isLoading, follow, unfollow]);

  const baseStyles =
    'min-w-[5.5rem] px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-200 select-none';

  const followingStyles = isFollowing
    ? 'bg-transparent text-base-content border-2 border-base-300 hover:border-base-content/50 hover:bg-base-300 active:scale-[0.98] active:bg-base-300'
    : 'bg-base-content text-base-100 border-2 border-transparent hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] active:brightness-95';

  const loadingStyles = isLoading
    ? 'pointer-events-none opacity-70 cursor-wait'
    : 'cursor-pointer';

  return (
    <>
      <button
        type="button"
        className={`${baseStyles} ${followingStyles} ${loadingStyles}`}
        onClick={toggleFollow}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label={isLoading ? 'Updating…' : isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm" aria-hidden />
        ) : (
          isFollowing ? 'Following' : 'Follow'
        )}
      </button>
      <ErrorToast error={error} />
    </>
  );
};
