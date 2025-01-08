import { useEffect, useState } from 'react';
import { useFeedContext } from '../../feed-context';
import { AggregatedActivities } from '@stream-io/feeds-client';
import { FollowRequestNotification } from './notification-types/FollowRequestNotification';
import { SimpleNotification } from './notification-types/SimpleNotification';
import { FollowInviteNotification } from './notification-types/FollowInviteNotification';
import { PaginatedList } from '../PaginatedList';
import { useErrorContext } from '@/app/error-context';

export const NotificationFeed = (proprs: { onLoadMore?: () => void }) => {
  const { logError } = useErrorContext();
  const { onLoadMore } = proprs;
  const [error, setError] = useState<Error>();
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

  const getNextPage = async () => {
    setError(undefined);
    try {
      await ownNotifications?.readNextPage();
    } catch (error) {
      setError(error as Error);
    }
  };

  const markRead = async (group: AggregatedActivities) => {
    if (!group.read) {
      try {
        await ownNotifications?.read({
          limit: 30,
          offset: 0,
          mark_read: group.id,
        });
        await ownNotifications?.read({ limit: 30, offset: 0 });
      } catch (error) {
        logError(error as Error);
      }
    }
  };

  const renderItem = (group: AggregatedActivities, index: number) => {
    return (
      <li key={`notification:${index}`} className="w-full">
        {group.activities[0]?.verb === 'follow-request' && (
          <FollowRequestNotification
            group={group}
            onMarkRead={() => markRead(group)}
          ></FollowRequestNotification>
        )}
        {group.activities[0]?.verb === 'invite' && (
          <FollowInviteNotification
            group={group}
            onMarkRead={() => markRead(group)}
          ></FollowInviteNotification>
        )}
        {group.activities[0]?.verb !== 'invite' &&
          group.activities[0]?.verb !== 'follow-request' && (
            <SimpleNotification
              group={group}
              onMarkRead={() => markRead(group)}
            ></SimpleNotification>
          )}
      </li>
    );
  };

  return (
    <>
      <PaginatedList
        items={groups}
        hasNext={hasNextPage}
        isLoading={isLoading}
        onLoadMore={() => {
          void getNextPage();
          onLoadMore?.();
        }}
        renderItem={renderItem}
        error={error}
        itemsName="notifications"
      ></PaginatedList>
    </>
  );
};
