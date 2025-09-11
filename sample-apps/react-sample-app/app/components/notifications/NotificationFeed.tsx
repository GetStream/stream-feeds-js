import { useFeedContext } from '../../feed-context';
import type { AggregatedActivityResponse } from '@stream-io/feeds-client';
import {
  useAggregatedActivities,
  useNotificationStatus,
  useStateStore,
} from '@stream-io/feeds-client/react-bindings';
import { Notification } from './Notification';
import { PaginatedList } from '../PaginatedList';
import { useErrorContext } from '@/app/error-context';
import { useCallback, useEffect, useState } from 'react';

export const NotificationFeed = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const { ownNotifications } = useFeedContext();
  const [seenActivities, setSeenActivities] = useState<string[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<Date | undefined>(undefined);

  const { last_read_at: lastReadAt, read_activities: readActivities = [] } =
    useNotificationStatus(ownNotifications) ?? {};

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

  const hasUnreadNotifications = aggregatedActivities.some(
    (group) => !readActivities.includes(group.group),
  );

  const renderItem = useCallback(
    (group: AggregatedActivityResponse, index: number) => {
      return (
        <li key={`notification:${index}`} className="w-full">
          <Notification
            group={group}
            isRead={
              (lastReadAt &&
                group.updated_at.getTime() <= lastReadAt.getTime()) ||
              readActivities.includes(group.group)
            }
            isSeen={
              (lastSeenAt &&
                group.updated_at.getTime() < lastSeenAt.getTime()) ||
              seenActivities.includes(group.group)
            }
            onMarkRead={() => markRead(group)}
          />
        </li>
      );
    },
    [readActivities, lastSeenAt, seenActivities, markRead],
  );

  return (
    <>
      {hasUnreadNotifications && (
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
