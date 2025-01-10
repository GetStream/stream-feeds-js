import {
  Activity as StreamActivity,
  StreamFlatFeedClient,
} from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { Activity } from './Activity';
import { v4 as uuidv4 } from 'uuid';
import { LoadingIndicator } from './LoadingIndicator';
import { Invite } from './Invite';
import { PaginatedList } from './PaginatedList';
import { useErrorContext } from '../error-context';
import Link from 'next/link';
import {
  AppNotificaion,
  useAppNotificationsContext,
} from '../app-notifications-context';
import { pageTitle } from '../page-title';

export const Feed = ({
  feed,
  readOnly,
  onNewPost,
}: {
  feed: StreamFlatFeedClient;
  readOnly: boolean;
  onNewPost: 'show-immediately' | 'show-notification';
}) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const { showNotification } = useAppNotificationsContext();
  const [activities, setActivities] = useState<StreamActivity[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [post, setPost] = useState<string>('');
  const [newPostsNotification, setNewPostsNotification] =
    useState<AppNotificaion>();

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

  const sendPost = async () => {
    setIsSending(true);
    try {
      await feed.addActivity({
        verb: 'post',
        object: uuidv4(),
        // TODO: we don't yet have enrichment, so we just store data in custom property
        custom: {
          text: post,
        },
      });
      setPost('');
    } catch (error) {
      logErrorAndDisplayNotification(
        error as Error,
        `Failed to send post, this could've been a temporary issue, try again`,
      );
    } finally {
      setIsSending(false);
    }
  };

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
        <Activity activity={activity}></Activity>
      </li>
    );
  };

  return (
    <>
      <div className="w-full flex flex-col items-center gap-3">
        {!readOnly && (
          <div className="self-end">
            <Invite feed={feed}></Invite>
          </div>
        )}
        {!readOnly && (
          <div className="w-full">
            <textarea
              id="question"
              name="question"
              value={[post]}
              onChange={(e) => setPost(e.target.value)}
              rows={5}
              placeholder="Write your post here..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
              onClick={() => sendPost()}
              disabled={isSending || post === ''}
            >
              {isSending ? <LoadingIndicator></LoadingIndicator> : 'Post'}
            </button>
          </div>
        )}
        <PaginatedList
          items={activities}
          isLoading={isLoading}
          hasNext={hasNextPage}
          renderItem={renderItem}
          onLoadMore={getNextPage}
          error={error}
          itemsName="posts"
        ></PaginatedList>
        {readOnly && !isLoading && !error && activities.length === 0 && (
          <Link href="/users" className="underline">
            Start following people
          </Link>
        )}
      </div>
    </>
  );
};
