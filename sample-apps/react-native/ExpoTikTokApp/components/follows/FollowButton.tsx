import type { Feed, FollowResponse } from '@stream-io/feeds-react-native-sdk';
import { useOwnFollows } from '@stream-io/feeds-react-native-sdk';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/common/Themed';
import { useOwnFeedsContext } from '@/contexts/OwnFeedsContext';
import { useStableCallback } from '@/hooks/useStableCallback';

const getFollowStatusText = (
  followStatus: FollowResponse['status'] | undefined,
) => {
  switch (followStatus) {
    case 'accepted':
      return 'Following';
    case 'pending':
      return 'Requested';
    case 'rejected':
    default:
      return 'Follow';
  }
};

export const FollowButton = ({ feed }: { feed: Feed }) => {
  const { ownTimelineFeed } = useOwnFeedsContext();
  const { own_follows: ownFollows } = useOwnFollows(feed) ?? {};
  const ownFollow = useMemo(
    () =>
      ownFollows &&
      ownFollows.find(
        (follow: FollowResponse) => follow.source_feed.group_id === 'timeline',
      ),
    [ownFollows],
  );
  const followStatus = ownFollow?.status;

  const followStatusText = useMemo(
    () => getFollowStatusText(followStatus),
    [followStatus],
  );

  const toggleFollowButton = useStableCallback(async () => {
    if (!ownTimelineFeed) return;

    try {
      if (followStatus === 'accepted' || followStatus === 'pending') {
        await ownTimelineFeed.unfollow(feed);
      } else {
        await ownTimelineFeed.follow(feed, {
          create_notification_activity: true,
          push_preference: 'all',
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <TouchableOpacity onPress={toggleFollowButton} style={styles.followButton}>
      <Text style={styles.followButtonText}>{followStatusText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  followButton: {
    alignSelf: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  followButtonText: { fontWeight: '600' },
});
