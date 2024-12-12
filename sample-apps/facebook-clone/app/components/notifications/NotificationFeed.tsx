import { useEffect, useState } from 'react';
import { useFeedContext } from '../../feed-context';
import { AggregatedActivities } from '@stream-io/feeds-client';
import { LoadingIndicator } from '../LoadingIndicator';
import { FollowRequestNotification } from './notification-types/FollowRequestNotification';
import { SimpleNotification } from './notification-types/SimpleNotification';

export const NotificationFeed = (proprs: {
  loadMoreText?: string;
  onLoadMore?: () => void;
}) => {
  const { loadMoreText = 'Load more', onLoadMore } = proprs;
  const [groups, setGroups] = useState<AggregatedActivities[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const { ownNotifications } = useFeedContext();

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({ groups: state.groups }),
      ({ groups }) => {
        setGroups(groups ?? []);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({ is_loading_next_page: state.is_loading_next_page }),
      ({ is_loading_next_page }) => {
        setIsLoading(is_loading_next_page);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  useEffect(() => {
    if (!ownNotifications) {
      return;
    }
    const unsubscribe = ownNotifications.state.subscribeWithSelector(
      (state) => ({ has_next_page: state.has_next_page }),
      ({ has_next_page }) => {
        setHasNextPage(has_next_page);
      },
    );

    return unsubscribe;
  }, [ownNotifications]);

  const getNextPage = () => {
    ownNotifications?.readNextPage().catch((err) => {
      throw err;
    });
  };

  const markRead = async (group: AggregatedActivities) => {
    if (!group.read) {
      await ownNotifications?.read({
        limit: 30,
        offset: 0,
        mark_read: group.id,
      });
      await ownNotifications?.read({ limit: 30, offset: 0 });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 text-gray-800 overflow-auto">
        {groups.length === 0 && isLoading && (
          <LoadingIndicator color={'blue'}></LoadingIndicator>
        )}
        {groups.length === 0 && !isLoading && (
          <div>You're all caught up 🎉</div>
        )}
        {groups.map((g, i) => (
          <div
            key={`notification:${i}`}
            className="text-gray-800 flex items-center justify-between gap-1"
          >
            {g.activities[0]?.verb === 'follow-request' ? (
              <FollowRequestNotification
                group={g}
                onMarkRead={() => markRead(g)}
              ></FollowRequestNotification>
            ) : (
              <SimpleNotification
                group={g}
                onMarkRead={() => markRead(g)}
              ></SimpleNotification>
            )}
          </div>
        ))}
      </div>
      {groups.length > 0 && hasNextPage && (
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => {
            getNextPage();
            onLoadMore?.();
          }}
        >
          {isLoading ? <LoadingIndicator></LoadingIndicator> : loadMoreText}
        </button>
      )}
    </>
  );
};
