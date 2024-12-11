import {
  Activity as StreamActivity,
  StreamFlatFeedClient,
} from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { Activity } from './Activity';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { LoadingIndicator } from './LoadingIndicator';

export const Feed = ({
  feed,
  readOnly,
}: {
  feed: StreamFlatFeedClient;
  readOnly: boolean;
}) => {
  const [activities, setActivities] = useState<StreamActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [post, setPost] = useState<string>('');

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({ activities: state.activities }),
      ({ activities }) => {
        setActivities(activities ?? []);
      },
    );

    return unsubscribe;
  }, [feed]);

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

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({ following_count: state.following_count }),
      ({ following_count }) => {
        setFollowingCount(following_count ?? 0);
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
    } finally {
      setIsSending(false);
    }
  };

  const getNextPage = () => {
    feed.readNextPage().catch((err) => {
      throw err;
    });
  };

  return (
    <>
      <div className="w-3/4 m-auto flex flex-col items-center gap-3 overflow-auto">
        {!readOnly && (
          <div className="w-full">
            <textarea
              id="question"
              name="question"
              value={[post]}
              onChange={(e) => setPost(e.target.value)}
              rows={5}
              placeholder="Write your post here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
        {activities.length === 0 && isLoading && (
          <LoadingIndicator color={'blue'}></LoadingIndicator>
        )}
        {activities.length === 0 &&
          !isLoading &&
          readOnly &&
          followingCount === 0 && (
            <div className="text-gray-800">
              Start{' '}
              <Link href="/users" className="underline">
                following people
              </Link>{' '}
              to see posts
            </div>
          )}
        {activities.length === 0 &&
          !isLoading &&
          readOnly &&
          followingCount > 0 && (
            <div className="text-gray-800">No posts yet</div>
          )}
        {activities.map((a) => (
          <Activity key={a.id} activity={a}></Activity>
        ))}
        {activities.length > 0 && hasNextPage && (
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => getNextPage()}
          >
            {isLoading ? <LoadingIndicator></LoadingIndicator> : 'Load more'}
          </button>
        )}
      </div>
    </>
  );
};
