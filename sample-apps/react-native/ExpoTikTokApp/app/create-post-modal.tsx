import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { ActivityComposer } from '@/components/ActivityComposer';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StreamFeed,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

export default function ModalScreen() {
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
    <SafeAreaView style={{ flex: 1 }}>
      <StreamFeed feed={feed}>
        <ActivityComposer />
      </StreamFeed>
    </SafeAreaView>
  );
}
