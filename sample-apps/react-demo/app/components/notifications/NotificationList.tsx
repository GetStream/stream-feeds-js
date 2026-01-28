import {
  useFeedContext,
  useAggregatedActivities,
  useNotificationStatus,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { Notification } from './Notification';
import { LoadingIndicator } from '../utility/LoadingIndicator';

export const NotificationList = () => {
  const feed = useFeedContext();
  const [isLoading, setIsLoading] = useState(false);
  const {
    aggregated_activities: notifications,
    loadNextPage,
    has_next_page,
  } = useAggregatedActivities() ?? { aggregated_activities: [] };
  const { unread } = useNotificationStatus() ?? { unread: 0 };

  const loadNext = useCallback(() => {
    setIsLoading(true);
    void loadNextPage?.().finally(() => {
      setIsLoading(false);
    });
  }, [loadNextPage]);

  const markAllAsRead = useCallback(() => {
    void feed?.markActivity({ mark_all_read: true });
  }, [feed]);

  return (
    <div className="w-full flex flex-col items-center justify-start max-h-full h-full gap-4">
      <div className="w-full flex flex-row items-center justify-between">
        <div className="text-lg font-semibold">Notifications</div>
        <button
          disabled={unread === 0}
          className="btn btn-primary"
          onClick={markAllAsRead}
        >
          Mark read
        </button>
      </div>
      {notifications.length === 0 ? (
        <div className="card card-border bg-base-100 w-96">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No notifications yet</h2>
            <p>When people like or comment, they will show up here</p>
          </div>
        </div>
      ) : (
        <>
          <ul className="list w-full overflow-y-auto">
            {notifications.map((notification) => (
              <li className="list-row w-full flex flex-row justify-stretch items-stretch" key={notification.group}>
                <Notification notification={notification} />
              </li>
            ))}
          </ul>
          {has_next_page && (
            <button className="btn btn-soft btn-primary" onClick={loadNext}>
              {isLoading ? <LoadingIndicator /> : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
