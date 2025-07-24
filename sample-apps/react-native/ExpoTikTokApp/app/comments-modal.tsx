import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Comments, CommentsInput } from '@/components/Comments';
import { useLocalSearchParams } from 'expo-router';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';
import {
  StreamFeed,
  useFeedActivities,
} from '@stream-io/feeds-react-native-sdk';
import { CommentsInputContextProvider } from '@/contexts/CommentsInputContext';

const CommentsModalUI = ({ activityId }: { activityId: string }) => {
  const { activities } = useFeedActivities();
  const activity = useMemo(
    () => (activities ?? []).find((a) => a.id === activityId),
    [activities, activityId],
  );

  return (
    <SafeAreaView style={styles.container}>
      <CommentsInputContextProvider>
        {activity ? <Comments activity={activity} /> : null}
        <CommentsInput activityId={activityId} />
      </CommentsInputContextProvider>
    </SafeAreaView>
  );
};

const CommentsModal = () => {
  const {
    feedGroupId: feedGroupIdParam,
    feedUserId: feedUserIdParam,
    activityId: activityIdParam,
  } = useLocalSearchParams();

  const feedGroupId = feedGroupIdParam as string;
  const activityId = activityIdParam as string;
  const feedUserid = feedUserIdParam as string;

  const feedConfig = useMemo(
    () => ({ userId: feedUserid, groupId: feedGroupId }),
    [feedUserid, feedGroupId],
  );

  const feed = useCreateAndQueryFeed(feedConfig);

  if (!feed) {
    return null;
  }

  return (
    <StreamFeed feed={feed}>
      <CommentsModalUI activityId={activityId} />
    </StreamFeed>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 32,
  },
});
