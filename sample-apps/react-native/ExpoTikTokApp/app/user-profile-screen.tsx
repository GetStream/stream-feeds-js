import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';
import { Profile } from '@/components/Profile';
import { View } from '@/components/Themed';
import { StyleSheet } from 'react-native';

const queryOptions = {
  watch: true,
};

const UserProfileScreen = () => {
  const { userId: userIdParam } = useLocalSearchParams();
  // sigh
  const userId = userIdParam as string;

  const userFeedConfig = useMemo(
    () => ({
      groupId: 'user',
      userId,
      queryOptions,
    }),
    [userId],
  );
  const timelineFeedConfig = useMemo(
    () => ({
      groupId: 'timeline',
      userId,
      queryOptions,
    }),
    [userId],
  );

  const userFeed = useCreateAndQueryFeed(userFeedConfig);
  const timelineFeed = useCreateAndQueryFeed(timelineFeedConfig);

  if (!userFeed || !timelineFeed) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Profile userFeed={userFeed} timelineFeed={timelineFeed} />
    </View>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, backgroundColor: '#fff' },
});
