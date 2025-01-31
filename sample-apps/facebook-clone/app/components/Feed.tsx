import {
  Activity as StreamActivity,
  StreamFlatFeedClient,
} from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { Activity } from './Activity';
import { PaginatedList } from './PaginatedList';
import {
  AppNotificaion,
  useAppNotificationsContext,
} from '../app-notifications-context';
import { pageTitle } from '../page-title';

export const Feed = ({
  feed,
  onNewPost,
}: {
  feed: StreamFlatFeedClient;
  onNewPost: 'show-immediately' | 'show-notification';
}) => {
  const { showNotification } = useAppNotificationsContext();
  const [activities, setActivities] = useState<StreamActivity[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [newPostsNotification, setNewPostsNotification] =
    useState<AppNotificaion>();
  const [ownCapabilities, setOwnCapabilities] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({
        activities: state.activities,
      }),
      (state, prevState) => {
        const activities = state.activities ?? [];
        const prevActivities = prevState?.activities;
        // When we receive feeds.activity_added we won't immediately update the list, just display a notification about new activities
        if (
          onNewPost === 'show-immediately' ||
          !prevActivities ||
          activities.length <= prevActivities.length ||
          isLoading
        ) {
          setActivities(activities);
          if (newPostsNotification) {
            newPostsNotification.hide();
            document.title = pageTitle;
          }
        }
      },
    );

    return unsubscribe;
  }, [feed, isLoading, onNewPost]);

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({
        own_capabilities: state.own_capabilities,
      }),
      (state) => {
        setOwnCapabilities(state.own_capabilities ?? []);
      },
    );

    return unsubscribe;
  }, [feed]);

  useEffect(() => {
    if (onNewPost === 'show-immediately') {
      return;
    }
    const unsubscribe = feed.on('feeds.activity_added', () => {
      const numberOfNewPosts =
        (feed.state.getLatestValue().activities?.length ?? 0) -
        activities.length;
      if (numberOfNewPosts > 0) {
        document.title = `${pageTitle} (${numberOfNewPosts})`;
        if (!newPostsNotification) {
          const notification = showNotification({
            message: 'There are new posts',
            type: 'info',
            action: {
              label: 'Show me',
              onClick: () => {
                setActivities(feed.state.getLatestValue().activities ?? []);
                document.title = pageTitle;
                setNewPostsNotification(undefined);
                notification.hide();
                // TODO this is a bit hacky
                document
                  .getElementById('scrollContainer')
                  ?.scrollTo({ top: 0 });
              },
            },
          });
          setNewPostsNotification(notification);
        }
      }
    });

    return unsubscribe;
  }, [feed, onNewPost, activities]);

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({ is_loading_next_page: state.is_loading_next_page }),
      ({ is_loading_next_page }) => {
        setIsLoading(is_loading_next_page);
      },
    );

    return unsubscribe;
  }, [feed]);

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({ has_next_page: state.has_next_page }),
      ({ has_next_page }) => {
        setHasNextPage(has_next_page);
      },
    );

    return unsubscribe;
  }, [feed]);

  const getNextPage = () => {
    setError(undefined);
    setIsLoading(true);
    feed
      .readNextPage()
      .catch((err) => {
        setError(err);
      })
      .finally(() => setIsLoading(false));
  };

  const renderItem = (activity: StreamActivity) => {
    return (
      <li className="w-full" key={activity.id}>
        <Activity
          activity={activity}
          ownCapabilities={ownCapabilities}
        ></Activity>
      </li>
    );
  };

  return (
    <PaginatedList
      items={activities}
      isLoading={isLoading}
      hasNext={hasNextPage}
      renderItem={renderItem}
      onLoadMore={getNextPage}
      error={error}
      itemsName="posts"
    ></PaginatedList>
  );
};
