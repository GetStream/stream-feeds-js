import type { AggregatedActivityResponse } from '@stream-io/feeds-client';
import { useRouter } from 'expo-router';
import {
  useFeedContext,
  useIsAggregatedActivityRead,
} from '@stream-io/feeds-react-native-sdk';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useMemo } from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';
import { Image, Pressable, StyleSheet } from 'react-native';
import { Text, View } from '@/components/common/Themed';
import { getRoutingParams } from '@/components/notifications/utils/getRoutingParams';
import { getNotificationText } from '@/components/notifications/utils/getNotificationText';

export const NotificationItem = ({
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

  const notificationText = useMemo(
    () => getNotificationText(aggregatedActivity),
    [aggregatedActivity],
  );

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

  const routingParams = useMemo(
    () => getRoutingParams(lastActivity),
    [lastActivity],
  );

  const onPress = useStableCallback(() => {
    markRead();
    // @ts-expect-error Routing parameters type error, should be fixed once we type them explicitly
    router.push(routingParams);
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

const styles = StyleSheet.create({
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
});
