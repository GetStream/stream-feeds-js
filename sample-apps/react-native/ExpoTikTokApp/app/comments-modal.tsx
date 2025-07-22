import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommentsInput } from '@/components/CommentInput';
import { Comments } from '@/components/Comments';
import { useLocalSearchParams } from 'expo-router';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';
import {
  StreamFeed,
  useClientConnectedUser,
  useFeedActivities,
} from '@stream-io/feeds-react-native-sdk';

const CommentsModalUI = ({ activityId }: { activityId: string }) => {
  const { activities } = useFeedActivities();
  const activity = useMemo(
    () => (activities ?? []).find((a) => a.id === activityId),
    [activities, activityId],
  );

  return (
    <SafeAreaView style={styles.container}>
      {activity ? <Comments activity={activity} /> : null}
      <CommentsInput activityId={activityId} />
    </SafeAreaView>
  );
};

const CommentsModal = () => {
  const connectedUser = useClientConnectedUser();
  const { feedGroupId: feedGroupIdParam, activityId: activityIdParam } =
    useLocalSearchParams();

  const feedGroupId = feedGroupIdParam as string;
  const activityId = activityIdParam as string;

  const feedConfig = useMemo(
    () => ({ userId: connectedUser?.id, groupId: feedGroupId }),
    [connectedUser?.id, feedGroupId],
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
