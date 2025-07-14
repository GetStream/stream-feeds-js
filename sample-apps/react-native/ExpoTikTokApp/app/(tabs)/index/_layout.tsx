import React, { useEffect, useMemo } from 'react';
import { Stack } from 'expo-router';
import {
  StreamFeed,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useUserContext } from '@/contexts/UserContext';

export default function TabOneLayout() {
  const { user } = useUserContext();
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  const feed = useMemo(() => {
    if (!client || !user) {
      return;
    }

    return client.feed('timeline', user.id);
  }, [client, user]);

  useEffect(() => {
    if (!feed || !connectedUser) {
      return;
    }

    feed.getOrCreate({ watch: true }).catch((error) => console.error(error));
  }, [feed, connectedUser]);

  if (!feed) {
    return null;
  }

  return (
    <StreamFeed feed={feed}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Timeline',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="create-post-modal"
          options={{ title: 'New Post', presentation: 'modal' }}
        />
      </Stack>
    </StreamFeed>
  );
}
