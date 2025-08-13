import { useEffect, useState } from 'react';
import { useFeedContext } from '../../feed-context';
import type { AggregatedActivityResponse } from '@stream-io/feeds-client';
import { useNotificationStatus } from '@stream-io/feeds-client/react-bindings';
import { Notification } from './Notification';
import { PaginatedList } from '../PaginatedList';
import { useErrorContext } from '@/app/error-context';

export const NotificationFeed = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [aggregatedActivities, setAggregatedActivities] = useState<
    AggregatedActivityResponse[]
  >([]);
  const { ownNotifications } = useFeedContext();

  const {
    last_read_at: lastReadAt,
    last_seen_at: lastSeenAt,
    read_activities: readActivities = [],
    seen_activities: seenActivities = [],
  } = useNotificationStatus(ownNotifications) ?? {};

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({
        aggregated_activities: state.aggregated_activities,
      }),
      ({ aggregated_activities }) => {
        setAggregatedActivities(aggregated_activities ?? []);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  const markRead = async (group: AggregatedActivityResponse) => {
    try {
      await ownNotifications?.markActivity({
        mark_read: [group.group],
      });
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const markAllRead = async () => {
    try {
      await ownNotifications?.markActivity({
        mark_all_read: true,
      });
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const hasUnreadNotifications = aggregatedActivities.some(
    (group) => !readActivities.includes(group.group),
  );

  const renderItem = (group: AggregatedActivityResponse, index: number) => {
    return (
      <li key={`notification:${index}`} className="w-full">
        <Notification
          group={group}
          isRead={
            (lastReadAt && group.updated_at.getTime() < lastReadAt.getTime()) ||
            readActivities.includes(group.group)
          }
          isSeen={
            (lastSeenAt && group.updated_at.getTime() < lastSeenAt.getTime()) ||
            seenActivities.includes(group.group)
          }
          onMarkRead={() => markRead(group)}
        ></Notification>
      </li>
    );
  };

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
        hasNext={false}
        isLoading={false}
        onLoadMore={() => {}}
        renderItem={renderItem}
        itemsName="notifications"
      ></PaginatedList>
    </>
  );
};
