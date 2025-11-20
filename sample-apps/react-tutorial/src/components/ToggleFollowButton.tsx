import {
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { useOwnFeedContext } from '../own-feeds-context';

export const ToggleFollowButton = ({
  userId,
  isFollowing: initialIsFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) => {
  const { ownTimeline, ownStoryTimeline } = useOwnFeedContext();
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const follow = useCallback(async () => {
    await client?.followBatch({
      follows: [
        {
          source: `timeline:${currentUser?.id}`,
          create_notification_activity: true,
          target: `user:${userId}`,
        },
        {
          source: `stories:${currentUser?.id}`,
          target: `story:${userId}`,
        },
      ],
    });
    setIsFollowing(true);
    await ownTimeline?.getOrCreate({ watch: true });
    await ownStoryTimeline?.getOrCreate({ watch: true });
  }, [client, userId, currentUser?.id, ownTimeline, ownStoryTimeline]);

  const unfollow = useCallback(async () => {
    await client?.unfollow({
      source: `timeline:${currentUser?.id}`,
      target: `user:${userId}`,
    });
    await client?.unfollow({
      source: `stories:${currentUser?.id}`,
      target: `story:${userId}`,
    });
    setIsFollowing(false);
    await ownTimeline?.getOrCreate({ watch: true });
    await ownStoryTimeline?.getOrCreate({ watch: true });
  }, [client, userId, currentUser?.id, ownTimeline, ownStoryTimeline]);

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
