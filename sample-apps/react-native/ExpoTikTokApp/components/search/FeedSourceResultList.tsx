import {
  Feed,
  useClientConnectedUser,
  useFeedMetadata,
  useSearchResult,
} from '@stream-io/feeds-react-native-sdk';
import { FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FollowButton } from '@/components/follows/FollowButton';
import { View, Text } from '@/components/common/Themed';
import { useRouter } from 'expo-router';
import { ErrorIndicator, LoadingIndicator } from '@/components/indicators';
import { useStableCallback } from '@/hooks/useStableCallback';

const keyExtractor = (item: Feed) => item.id;

const UserSeparator = () => <View style={styles.separator} />;

const UserItem = ({ feed }: { feed: Feed }) => {
  const router = useRouter();
  const connectedUser = useClientConnectedUser();
  const { created_by: createdBy } = useFeedMetadata(feed) ?? {};

  const onPress = useStableCallback(() =>
    router.push({
      pathname: '/user-profile-screen',
      params: { userId: createdBy?.id },
    }),
  );

  return (
    <TouchableOpacity onPress={onPress} style={styles.userRow}>
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
      {createdBy?.id !== connectedUser?.id ? (
        <FollowButton feed={feed}></FollowButton>
      ) : null}
    </TouchableOpacity>
  );
};

const HashtagItem = ({ feed }: { feed: Feed }) => {
  const router = useRouter();

  const onPress = useStableCallback(() =>
    router.push({
      pathname: '/hashtag-screen',
      params: { id: feed.id },
    }),
  );

  return (
    <TouchableOpacity onPress={onPress} style={styles.hashtagRow}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconHash}>#</Text>
      </View>

      <View style={styles.textCol}>
        <Text style={styles.tagText} numberOfLines={1}>
          {feed.id}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const renderItem = ({ item }: { item: Feed }) => {
  return item.group === 'user' ? (
    <UserItem feed={item} />
  ) : (
    <HashtagItem feed={item} />
  );
};

export const FeedSourceResultList = () => {
  const { items: feeds, error, isLoading, loadMore } = useSearchResult();

  if (error) {
    return <ErrorIndicator context="user feeds" />;
  }

  if (isLoading && !feeds) {
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
  container: { flex: 1, backgroundColor: '#fff' },
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
  hashtagRow: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  iconHash: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  textCol: {
    flex: 1,
  },
  tagText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#111827', // gray-900
    fontWeight: '600',
  },
});
