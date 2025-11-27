import type { AggregatedActivityResponse } from '@stream-io/feeds-client';
import {
  StreamFeed,
  useAggregatedActivities,
  useFeedContext,
  useIsAggregatedActivityRead,
  useNotificationStatus,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { Notification } from './Notification';
import { PaginatedList } from '../PaginatedList';
import { useErrorContext } from '@/app/error-context';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOwnFeedsContext } from '@/app/own-feeds-context';

export const NotificationFeed = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { ownNotifications } = useOwnFeedsContext();

  if (!ownNotifications) {
    return null;
  }

  return (
    <StreamFeed feed={ownNotifications}>
      <NotificationFeedUI isMenuOpen={isMenuOpen} />
    </StreamFeed>
  );
};

const NotificationFeedUI = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [seenActivities, setSeenActivities] = useState<string[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<Date | undefined>(undefined);
  const ownNotifications = useFeedContext();

  const { unread = 0 } = useNotificationStatus(ownNotifications) ?? {};

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({
        notification_status: state.notification_status,
      }),
      ({ notification_status }) => {
        if (!isMenuOpen) {
          setLastSeenAt(notification_status?.last_seen_at);
          setSeenActivities(notification_status?.seen_activities ?? []);
        }
      },
    );

    return unsubscribe;
  }, [isMenuOpen, ownNotifications]);

  const { next, isLoading } = useStateStore(
    ownNotifications?.state,
    (state) => ({
      next: state.next,
      isLoading: state.is_loading_activities,
    }),
  ) ?? {
    next: undefined,
    isLoading: false,
  };

  const { aggregated_activities: aggregatedActivities = [] } =
    useAggregatedActivities(ownNotifications) ?? {};

  const markRead = useCallback(
    async (group: AggregatedActivityResponse) => {
      try {
        await ownNotifications?.markActivity({
          mark_read: [group.group],
        });
      } catch (error) {
        logErrorAndDisplayNotification(error);
      }
    },
    [ownNotifications, logErrorAndDisplayNotification],
  );

  const getNextPage = () => {
    ownNotifications?.getNextPage().catch(logErrorAndDisplayNotification);
  };

  const markAllRead = async () => {
    try {
      await ownNotifications?.markActivity({
        mark_all_read: true,
      });
    } catch (error) {
      logErrorAndDisplayNotification(error);
    }
  };

  const renderItem = useCallback(
    (group: AggregatedActivityResponse) => {
      return (
        <NotificationItem
          key={group.group}
          group={group}
          lastSeenAt={lastSeenAt}
          seenActivities={seenActivities}
          onMarkRead={markRead}
        />
      );
    },
    [lastSeenAt, seenActivities, markRead],
  );

  return (
    <>
      {unread > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={markAllRead}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Mark all read
          </button>
        </div>
      )}
      <PaginatedList
        items={aggregatedActivities}
        hasNext={!!next}
        isLoading={isLoading}
        onLoadMore={getNextPage}
        renderItem={renderItem}
        itemsName="notifications"
      />
    </>
  );
};

const NotificationItem = ({
  group,
  lastSeenAt,
  seenActivities,
  onMarkRead,
}: {
  group: AggregatedActivityResponse;
  lastSeenAt: Date | undefined;
  seenActivities: string[];
  onMarkRead: (group: AggregatedActivityResponse) => void;
}) => {
  const isRead = useIsAggregatedActivityRead({
    aggregatedActivity: group,
  });

  // We only want to remove indicator after notification list is closed
  // If you don't need this, you can use useIsAggregatedActivitySeen instead
  const isSeen = useMemo(
    () =>
      (lastSeenAt && group.updated_at.getTime() <= lastSeenAt.getTime()) ||
      seenActivities.includes(group.group),
    [lastSeenAt, seenActivities, group.group, group.updated_at],
  );

  return (
    <li className="w-full">
      <Notification
        group={group}
        isRead={isRead}
        isSeen={isSeen}
        onMarkRead={() => onMarkRead(group)}
      />
    </li>
  );
};
