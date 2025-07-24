import { useEffect, useState } from 'react';
import {
  Feed,
  FeedState,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useStateStore } from '@stream-io/feeds-react-native-sdk';
import { FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FollowButton } from '@/components/FollowButton';
import { useStableCallback } from '@/hooks/useStableCallback';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { ErrorIndicator, LoadingIndicator } from '@/components/Indicators';

const selector = (state: FeedState) => {
  return {
    createdBy: state.created_by,
  };
};

const keyExtractor = (item: Feed) => item.id;

const UserSeparator = () => <View style={styles.separator} />;

const UserItem = ({ feed }: { feed: Feed }) => {
  const { createdBy } = useStateStore(feed.state, selector);
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/user-profile-screen',
          params: { userId: createdBy?.id },
        })
      }
      style={styles.userRow}
    >
      <View style={styles.userInfo}>
        <Image
          source={{
            uri:
              createdBy?.image ??
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>
          {createdBy?.name ?? `@${createdBy?.id}`}
        </Text>
      </View>
      <FollowButton feed={feed}></FollowButton>
    </TouchableOpacity>
  );
};

const renderItem = ({ item }: { item: Feed }) => {
  return <UserItem feed={item} />;
};

export const FeedSourceResultList = ({ types }: { types: Array<'user'> }) => {
  const client = useFeedsClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [next, setNext] = useState<string | undefined>(undefined);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const connectedUser = useClientConnectedUser();

  const loadMore = useStableCallback(async () => {
    if (!client || !connectedUser || isLoading) {
      return;
    }

    if (feeds.length > 0 && typeof next === 'undefined') {
      return;
    }

    setError(undefined);
    setIsLoading(true);
    const limit = 30;
    try {
      const response = await client.queryFeeds({
        limit,
        watch: true,
        filter: {
          group_id: { $in: types },
        },
        next,
      });
      const newFeeds = response.feeds.filter((f) => f.id !== connectedUser.id);
      setFeeds([...feeds, ...newFeeds]);
      setNext(response.next);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (!client || !connectedUser) {
      return;
    }
    void loadMore();
  }, [client, connectedUser, loadMore]);

  if (error) {
    return <ErrorIndicator context="user feeds" />;
  }

  if (isLoading && feeds.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feeds}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={UserSeparator}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
    color: '#1c1c1e',
  },
  listContent: { paddingHorizontal: 16 },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userName: { fontSize: 16, color: '#333' },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  follow: {
    backgroundColor: '#2563eb',
  },
  unfollow: {
    backgroundColor: '#e5e7eb',
  },
  followText: {
    color: 'white',
    fontWeight: '600',
  },
  unfollowText: {
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
