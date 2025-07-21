import { useEffect, useMemo } from 'react';
import {
  FollowResponse,
  useClientConnectedUser,
  useFeedsClient,
  useFollowers,
} from '@stream-io/feeds-react-native-sdk';
import { FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useStableCallback } from '@/hooks/useStableCallback';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';

const keyExtractor = (item: FollowResponse) => item.source_feed.id;

const UserSeparator = () => <View style={styles.separator} />;

const UserItem = ({ follow }: { follow: FollowResponse }) => {
  const createdBy = follow.source_feed.created_by;
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
    </TouchableOpacity>
  );
};

const renderItem = ({ item }: { item: FollowResponse }) => {
  return <UserItem follow={item} />;
};

export const Followers = () => {
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  const {
    followers: originalFollowers,
    has_next_page: hasNextPage,
    is_loading_next_page: isLoadingNextPage,
    loadNextPage,
  } = useFollowers() ?? {};

  const followers = useMemo(() => {
    if (!connectedUser) {
      return originalFollowers;
    }

    return originalFollowers?.filter(
      (f) => f.source_feed.created_by.id !== connectedUser.id,
    );
  }, [connectedUser, originalFollowers]);

  const loadMore = useStableCallback(async () => {
    if (hasNextPage && loadNextPage && !isLoadingNextPage) {
      await loadNextPage({ limit: 10 });
    }
  });

  useEffect(() => {
    if (!client || !connectedUser) {
      return;
    }
    void loadMore();
  }, [client, connectedUser, loadMore]);

  return (
    <View style={styles.container}>
      <FlatList
        data={followers}
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
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
