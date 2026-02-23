'use client';

import {
  StreamFeed,
  useAggregatedActivities,
  useNotificationStatus,
} from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';
import { useOwnFeedsContext } from '../own-feeds-context';
import { NotificationList } from '../components/notifications/NotificationList';
import { ErrorCard } from '../components/utility/ErrorCard';
import { NotificationsPageSkeleton } from '../components/utility/loading-skeletons/NotificationsPageSkeleton';
import { PageHeader } from '../components/utility/PageHeader';

export default function Notifications() {
  const { ownNotifications, errors } = useOwnFeedsContext();
  const { unread } = useNotificationStatus(ownNotifications) ?? { unread: 0 };
  const aggregatedState = useAggregatedActivities(ownNotifications ?? undefined);
  const isFetching = aggregatedState?.is_loading ?? false;
  const notifications = aggregatedState?.aggregated_activities ?? [];
  const showLoadingIndicator = !ownNotifications || (isFetching && notifications.length === 0);

  const markAllAsRead = useCallback(() => {
    void ownNotifications?.markActivity({ mark_all_read: true });
  }, [ownNotifications]);

  if (errors.ownNotifications) {
    return <ErrorCard message="Failed to load notifications" error={errors.ownNotifications} />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start max-h-full h-full">
      <PageHeader title="Notifications">
        <button
          disabled={unread === 0 || showLoadingIndicator}
          className="text-sm text-primary font-semibold hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
          onClick={markAllAsRead}
        >
          Mark read
        </button>
      </PageHeader>
      {showLoadingIndicator ? (
        <NotificationsPageSkeleton />
      ) : (
        <StreamFeed feed={ownNotifications}>
          <NotificationList />
        </StreamFeed>
      )}
    </div>
  );
}
