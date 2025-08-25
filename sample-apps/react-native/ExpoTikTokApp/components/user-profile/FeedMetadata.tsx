import { Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/common/Themed';
import React from 'react';
import {
  Feed,
  FeedState,
  useClientConnectedUser,
  useFeedMetadata,
  useStateStore,
} from '@stream-io/feeds-react-native-sdk';
import { FollowButton } from '@/components/follows/FollowButton';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const selector = (nextState: FeedState) => ({
  activityCount: nextState.activities?.length ?? 0,
});

export const FeedMetadata = ({
  userFeed,
  timelineFeed,
}: {
  userFeed: Feed;
  timelineFeed: Feed;
}) => {
  const router = useRouter();
  const connectedUser = useClientConnectedUser();
  const { created_by: createdBy, follower_count: followerCount = 0 } =
    useFeedMetadata(userFeed) ?? {};
  const { following_count: followingCount = 0 } =
    useFeedMetadata(timelineFeed) ?? {};
  // TODO: This is not the correct number of feeds, but it'll be a placeholder until
  //       this is supported by our backend.
  const { activityCount = 0 } = useStateStore(userFeed?.state, selector) ?? {};
  return (
    <>
      <Image source={{ uri: createdBy?.image }} style={styles.avatar} />
      <Text style={styles.username}>{createdBy?.name ?? createdBy?.id}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>
          {activityCount}
          {'\n'}Posts
        </Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/followers-modal',
              params: { userId: createdBy?.id },
            })
          }
        >
          <Text style={styles.stat}>
            {followerCount - 1}
            {'\n'}Followers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/following-modal',
              params: { userId: createdBy?.id },
            })
          }
        >
          <Text style={styles.stat}>
            {followingCount - 1}
            {'\n'}Following
          </Text>
        </TouchableOpacity>
        {connectedUser?.id !== createdBy?.id ? (
          <FollowButton feed={userFeed} />
        ) : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 8,
  },
  username: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  stat: { textAlign: 'center', fontSize: 14 },
  followButton: {
    alignSelf: 'center',
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  followButtonText: { fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    marginHorizontal: 16,
    color: '#888',
  },
  tabActive: {
    paddingVertical: 8,
    marginHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    fontWeight: '600',
  },
  postGrid: { paddingHorizontal: 12 },
  postCard: {
    width: SCREEN_WIDTH / 2 - 20,
    margin: 4,
  },
  postImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  postTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
