import { useEffect, useState } from 'react';
import { useFeedContext } from '../../feed-context';
import { AggregatedActivityResponse } from '@stream-io/feeds-client';
import { Notification } from './Notification';
import { PaginatedList } from '../PaginatedList';
import { useErrorContext } from '@/app/error-context';

export const NotificationFeed = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const [aggregatedActivities, setAggregatedActivities] = useState<
    AggregatedActivityResponse[]
  >([]);
  const [readActivities, setReadActivities] = useState<string[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<Date | undefined>(undefined);
  const { ownNotifications } = useFeedContext();

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({
        aggregated_activities: state.aggregated_activities,
        notification_status: state.notification_status,
      }),
      ({ aggregated_activities, notification_status }) => {
        setAggregatedActivities(aggregated_activities ?? []);
        setReadActivities(notification_status?.read_activities ?? []);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

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
        }
      },
    );

    return unsubscribe;
  }, [isMenuOpen, ownNotifications]);

  const markRead = async (group: AggregatedActivityResponse) => {
    try {
      await ownNotifications?.markActivity({
        mark_read: [group.group],
      });
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const renderItem = (group: AggregatedActivityResponse, index: number) => {
    return (
      <li key={`notification:${index}`} className="w-full">
        <Notification
          group={group}
          isRead={readActivities.includes(group.group)}
          isSeen={
            !!(lastSeenAt && group.created_at.getTime() < lastSeenAt.getTime())
          }
          onMarkRead={() => markRead(group)}
        ></Notification>
      </li>
    );
  };

  return (
    <>
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
