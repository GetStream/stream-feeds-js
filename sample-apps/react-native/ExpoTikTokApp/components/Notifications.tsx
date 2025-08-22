import { FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { View, Text } from '@/components/Themed';
import {
  AggregatedActivityResponse,
  useAggregatedActivities,
  useFeedContext,
} from '@stream-io/feeds-react-native-sdk';
import { useIsNotificationRead } from '@/hooks/useIsNotificationRead';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useMemo } from 'react';

const NotificationItem = ({ item }: { item: AggregatedActivityResponse }) => {
  const feed = useFeedContext();
  const isRead = useIsNotificationRead({ id: item.group });
  const lastActivity = item.activities[item.activity_count - 1];

  const formattedDate = useFormatDate({ date: lastActivity.created_at });

  const notificationText = useMemo(() => {
    const { activities } = item;
    const last = activities.at(-1);
    const verb = last?.type;

    let text = '';

    const remainingActors = item.user_count - 1;
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
  }, [item]);

  const markRead = useStableCallback(async () => {
    try {
      await feed?.markActivity({
        mark_read: [item.group],
      });
    } catch (error) {
      console.error(
        `An error has occurred while marking group ${item.group} as read: `,
        error,
      );
    }
  });

  return (
    <Pressable
      onPress={markRead}
      android_ripple={{ color: '#e5e7eb' }}
      style={styles.card}
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

export const Notifications = () => {
  const feed = useFeedContext();
  const { aggregated_activities } = useAggregatedActivities(feed) ?? {};

  return (
    <FlatList
      data={aggregated_activities}
      keyExtractor={(it) => it.group}
      renderItem={({ item }) => <NotificationItem item={item} />}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F9', // light gray page bg
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
