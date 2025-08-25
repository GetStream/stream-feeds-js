import React from 'react';
import {
  StreamFeed,
} from '@stream-io/feeds-react-native-sdk';
import { useLocalSearchParams } from 'expo-router';
import { ActivityPager } from '@/components/activity-pager/Pager';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';

const ActivityPagerScreen = () => {
  const { groupId: groupIdParam, id: idParam } = useLocalSearchParams();

  const groupId = groupIdParam as string;
  const id = idParam as string;

  const feed = useCreateAndQueryFeed({ groupId, userId: id });

  if (!feed) {
    return null;
  }

  return (
    <StreamFeed feed={feed}>
      <ActivityPager />
    </StreamFeed>
  );
}

export default ActivityPagerScreen;
