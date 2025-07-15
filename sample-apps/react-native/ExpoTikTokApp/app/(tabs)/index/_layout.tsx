import React from 'react';
import { Stack } from 'expo-router';
import {
  StreamFeed,
} from '@stream-io/feeds-react-native-sdk';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';

const createFeedConfig = {
  groupId: 'timeline',
  queryOptions: {
    watch: true
  }
}

export default function TabOneLayout() {
  const feed = useCreateAndQueryFeed(createFeedConfig);

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
