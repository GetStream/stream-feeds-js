import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FeedState } from '@stream-io/feeds-react-native-sdk';
import { useFeedMetadata } from '@stream-io/feeds-react-native-sdk';
import {
  useFeedContext,
  useStateStore,
} from '@stream-io/feeds-react-native-sdk';

const selector = ({ name, description }: FeedState) => ({ name, description });

export const HashtagFeedMetadata = () => {
  const feed = useFeedContext();
  const { name, description } = useStateStore(feed?.state, selector) ?? {};
  const { activity_count: activityCount } = useFeedMetadata() ?? {};

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={1}>
            #{name}
          </Text>
          <Text style={styles.subtitle}>{activityCount} posts</Text>
        </View>
      </View>

      <Text style={styles.description}>
        {description && description.length > 0
          ? description
          : 'No description provided'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingTop: 42,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 16,
    color: '#6B7280',
  },
  followBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  following: {
    backgroundColor: '#111827', // dark pill when following
    borderColor: '#111827',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  followText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  followingText: {
    color: '#FFFFFF',
  },
  description: {
    marginTop: 20,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280', // gray-500
  },
});
