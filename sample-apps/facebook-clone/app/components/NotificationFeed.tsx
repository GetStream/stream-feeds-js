import { useEffect, useState } from 'react';
import { useFeedContext } from '../feed-context';
import { AggregatedActivities } from '@stream-io/feeds-client';
import { LoadingIndicator } from './LoadingIndicator';

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

  const getNotificationText = (group: AggregatedActivities) => {
    let text = '';
    const previewCount = 5;
    text = Array.from(new Set(group.activities.map((a) => a.user.name)))
      .slice(0, previewCount)
      .join(', ');
    const remainingActors = group.actor_count - previewCount;
    if (remainingActors > 0) {
      text += ` and ${remainingActors} more people`;
    }
    const verb = group.activities[0].verb;

    switch (verb) {
      case 'follow':
        text += ` started following you`;
        break;
      case 'unfollow':
        text += ` unfollowed you`;
        break;
    }

    return text;
  };

  const markRead = async (group: AggregatedActivities) => {
    await ownNotifications?.read({ limit: 30, offset: 0, mark_read: group.id });
    await ownNotifications?.read({ limit: 30, offset: 0 });
  };

  const getNextPage = () => {
    ownNotifications?.readNextPage().catch((err) => {
      throw err;
    });
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
            key={`notification${i}`}
            className="text-gray-800 flex items-center justify-between gap-1"
          >
            <div>{getNotificationText(g)}</div>
            {!g.read && (
              <div className="flex items-center gap-1.5">
                <div className="rounded-full bg-blue-500 w-2 h-2"></div>
                <button
                  className="w-max px-1 py-0.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                  onClick={() => markRead(g)}
                >
                  Mark read
                </button>
              </div>
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
