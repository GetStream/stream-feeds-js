import React, { useMemo } from 'react';
import {
  StreamFeed,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useLocalSearchParams } from 'expo-router';
import { ActivityPager } from '@/components/ActivityPager/Pager';

export default function TimelineActivityScreen() {
  const client = useFeedsClient();
  const { groupId, id } = useLocalSearchParams();

  const feed = useMemo(
    () => client?.feed(groupId as string, id as string),
    [groupId, id, client],
  );

  if (!feed) {
    return null;
  }

  return (
    <StreamFeed feed={feed}>
      <ActivityPager />
    </StreamFeed>
  );
}
