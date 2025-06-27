import {
  ActivityResponse,
  FeedOwnCapability,
  Feed as StreamFeed,
} from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { Activity } from './Activity';
import { PaginatedList } from './PaginatedList';
import {
  AppNotificaion,
  useAppNotificationsContext,
} from '../app-notifications-context';
import { pageTitle } from '../page-title';
import { useStateStore } from '../hooks/useStateStore';
import { initializeFeed } from '../hooks/initializeFeed';

export const Feed = ({
  feed,
  onNewPost,
}: {
  feed: StreamFeed;
  onNewPost: 'show-immediately' | 'show-notification';
}) => {
  const { showNotification } = useAppNotificationsContext();
  const [error, setError] = useState<Error>();

  const [newPostsNotification, setNewPostsNotification] =
    useState<AppNotificaion>();

  const {
    hasNextPage,
    isLoading,
    activities,
    ownCapabilities = [],
  } = useStateStore(feed.state, (state) => ({
    isLoading: state.is_loading_activities,
    hasNextPage: typeof state.next !== 'undefined',
    activities: state.activities ?? [],
    ownCapabilities: state.own_capabilities,
  }));

  useEffect(() => {
    const currentState = feed.state.getLatestValue();

    if (
      !currentState.activities &&
      !currentState.is_loading_activities &&
      ownCapabilities.includes(FeedOwnCapability.READ_FEED)
    ) {
      void initializeFeed(feed, { watch: true });
    }
  }, [feed, ownCapabilities]);

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
    if (onNewPost === 'show-immediately') {
      return;
    }
    const unsubscribe = feed.on('feeds.activity.added', () => {
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

  const getNextPage = () => {
    setError(undefined);
    feed.getNextPage().catch(setError);
  };

  const renderItem = (activity: ActivityResponse) => {
    return (
      <li className="w-full" key={activity.id}>
        <Activity activity={activity} ownCapabilities={ownCapabilities} />
      </li>
    );
  };

  if (!ownCapabilities.includes('read-feed')) {
    return `You need to be a follower to see posts`;
  }

  return (
    <PaginatedList
      items={activities}
      isLoading={isLoading}
      hasNext={hasNextPage}
      renderItem={renderItem}
      onLoadMore={getNextPage}
      error={error}
      itemsName="posts"
    />
  );
};
