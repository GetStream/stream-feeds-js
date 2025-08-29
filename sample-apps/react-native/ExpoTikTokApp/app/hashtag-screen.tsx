import React from 'react';
import {
  StreamFeed,
} from '@stream-io/feeds-react-native-sdk';
import { useLocalSearchParams } from 'expo-router';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';
import { HashtagFeedMetadata } from '@/components/hashtags/HashtagFeedMetadata';
import { Feed } from '@/components/Feed';

const HashtagScreen = () => {
  const { id: idParam } = useLocalSearchParams();

  const id = idParam as string;

  const feed = useCreateAndQueryFeed({ groupId: 'hashtag', id });

  if (!feed) {
    return null;
  }

  return (
    <StreamFeed feed={feed}>
      <HashtagFeedMetadata />
      <Feed />
    </StreamFeed>
  );
}

export default HashtagScreen;
