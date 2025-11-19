import {
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';

export const ToggleFollowButton = ({
  userId,
  isFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) => {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();

  const follow = useCallback(() => {
    client?.followBatch({
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
  }, [client, userId, currentUser?.id]);

  const unfollow = useCallback(() => {
    client?.unfollow({
      source: `timeline:${currentUser?.id}`,
      target: `user:${userId}`,
    });
    client?.unfollow({
      source: `stories:${currentUser?.id}`,
      target: `story:${userId}`,
    });
  }, [client, userId, currentUser?.id]);

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
