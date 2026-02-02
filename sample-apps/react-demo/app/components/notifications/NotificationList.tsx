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
    <div className="w-full flex flex-col items-center justify-start max-h-full h-full gap-4">
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
              <li className="list-row w-full" key={notification.group}>
                <div className="list-col-grow w-full min-w-0">
                  <Notification notification={notification} />
                </div>
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
