import { FeedMetadata } from '@/components/FeedMetadata';
import { View } from '@/components/Themed';
import { StreamFeed } from '@stream-io/feeds-react-native-sdk';
import type { Feed as FeedType } from '@stream-io/feeds-react-native-sdk';
import { Feed } from '@/components/Feed';
import React from 'react';
import { StyleSheet } from 'react-native';

export const Profile = ({
  userFeed,
  timelineFeed,
}: {
  userFeed: FeedType;
  timelineFeed: FeedType;
}) => {
  return (
    <>
      <FeedMetadata userFeed={userFeed} timelineFeed={timelineFeed} />
      <View style={styles.feedContainer}>
        <StreamFeed feed={userFeed}>
          <Feed />
        </StreamFeed>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    paddingHorizontal: 16,
  },
});
