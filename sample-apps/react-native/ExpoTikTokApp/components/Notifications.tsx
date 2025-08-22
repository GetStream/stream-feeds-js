import { FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { AggregatedActivityResponse } from '@stream-io/feeds-react-native-sdk';
import {
  useAggregatedActivities,
  useFeedContext,
  useIsAggregatedActivityRead,
} from '@stream-io/feeds-react-native-sdk';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';

const NotificationItem = ({
  aggregatedActivity,
}: {
  aggregatedActivity: AggregatedActivityResponse;
}) => {
  const router = useRouter();
  const feed = useFeedContext();
  const isRead = useIsAggregatedActivityRead({ aggregatedActivity });
  const lastActivity =
    aggregatedActivity.activities[aggregatedActivity.activity_count - 1];

  const formattedDate = useFormatDate({ date: lastActivity.created_at });

  const notificationText = useMemo(() => {
    const { activities } = aggregatedActivity;
    const last = activities.at(-1);
    const verb = last?.type;

    let text = '';

    const remainingActors = aggregatedActivity.user_count - 1;
    if (remainingActors > 1) {
      text += ` and ${remainingActors} more people`;
    } else if (remainingActors === 1) {
      text += ' and 1 more person';
    }

    switch (verb) {
      case 'comment': {
        text += ` commented on your post`;
        break;
      }
      case 'reaction': {
        text += ` reacted to your post`;
        break;
      }
      case 'follow': {
        text += ` started following you`;
        break;
      }
      case 'comment_reaction': {
        text += ` reacted to your comment`;
        break;
      }
      default: {
        text += 'Unknown type';
        break;
      }
    }

    return text;
  }, [aggregatedActivity]);

  const markRead = useStableCallback(async () => {
    try {
      if (!isRead) {
        await feed?.markActivity({
          mark_read: [aggregatedActivity.group],
        });
      }
    } catch (error) {
      console.error(
        `An error has occurred while marking group ${aggregatedActivity.group} as read: `,
        error,
      );
    }
  });

  const routingParams = useMemo(() => {
    // Hardcoded because we always want to deep link to the
    // user feed.
    const groupId = 'user';
    const id = lastActivity.notification_context?.target.user_id;
    const activityId = lastActivity.notification_context?.target.id;
    return {
      activityId,
      groupId,
      id,
    };
  }, [lastActivity]);

  const onPress = useStableCallback(() => {
    markRead();
    router.push({ pathname: '/activity-pager-screen', params: routingParams });
  });

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#e5e7eb' }}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.5 : 1 }]}
    >
      <Image source={{ uri: lastActivity.user.image }} style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {lastActivity.user.name}
          </Text>
          <Text style={styles.time} numberOfLines={1}>
            {formattedDate}
          </Text>
        </View>

        <Text style={styles.message} numberOfLines={1}>
          {notificationText}
        </Text>
      </View>

      <View style={styles.trailing}>
        {!isRead ? <View style={styles.dot} /> : null}
      </View>
    </Pressable>
  );
};

const ItemSeparator = () => <View style={styles.separator} />;

const renderItem = ({ item }: { item: AggregatedActivityResponse }) => (
  <NotificationItem aggregatedActivity={item} />
);

const keyExtractor = (item: AggregatedActivityResponse) => item.group;

export const Notifications = () => {
  const feed = useFeedContext();
  const { aggregated_activities } = useAggregatedActivities(feed) ?? {};

  return (
    <FlatList
      data={aggregated_activities}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={ItemSeparator}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  message: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },
  trailing: {
    width: 18,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48', // red
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
