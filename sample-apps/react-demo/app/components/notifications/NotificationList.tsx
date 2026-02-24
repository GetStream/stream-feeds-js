import { useAggregatedActivities } from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { Notification } from './Notification';
import { LoadingIndicator } from '../utility/LoadingIndicator';

export const NotificationList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    aggregated_activities: notifications,
    loadNextPage,
    has_next_page,
  } = useAggregatedActivities() ?? { aggregated_activities: [] };

  const loadNext = useCallback(() => {
    setIsLoading(true);
    void loadNextPage?.().finally(() => {
      setIsLoading(false);
    });
  }, [loadNextPage]);

  return (
    <div className="w-full flex flex-col items-center justify-start max-h-full h-full">
      {notifications.length === 0 ? (
        <div className="w-full max-w-sm mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-semibold mb-2">No notifications yet</h2>
          <p className="text-base-content/60">When people like or comment, they will show up here</p>
        </div>
      ) : (
        <>
          <ul className="w-full overflow-y-auto">
            {notifications.map((notification) => (
              <li
                className="w-full px-4 py-3 border-b border-base-content/10 hover:bg-base-200/50 transition-colors"
                key={notification.group}
              >
                <Notification notification={notification} />
              </li>
            ))}
          </ul>
          {has_next_page && (
            <button className="btn btn-soft btn-primary my-4" onClick={loadNext}>
              {isLoading ? <LoadingIndicator /> : 'Load more'}
            </button>
          )}
          {!has_next_page && !isLoading && notifications.length > 0 && (
            <p className="py-8 text-center text-sm text-base-content/60">You've reached the end</p>
          )}
        </>
      )}
    </div>
  );
};
