'use client';
import { FeedMetadata } from '@/app/components/FeedMetadata';
import { useFeedContext } from '../../feed-context';
import { useEffect, useMemo } from 'react';
import { useUserContext } from '@/app/user-context';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { useParams } from 'next/navigation';
import { NewActivity } from '@/app/components/NewActivity';
import { Feed } from '@/app/components/Feed';
import { initializeFeed } from '@/app/hooks/initializeFeed';
import { useErrorContext } from '@/app/error-context';

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { user, client } = useUserContext();
  const { ownFeed, ownTimeline } = useFeedContext();
  const { logErrorAndDisplayNotification } = useErrorContext();

  const feed = useMemo(() => {
    if (!client || !user) return undefined;

    if (user?.id === params.id) {
      return ownFeed;
    }

    return client?.feed('user', params.id);
  }, [client, user, params.id, ownFeed]);

  const timeline = useMemo(() => {
    if (!client || !user) return undefined;

    if (user?.id === params.id) {
      return ownTimeline;
    }

    return client?.feed('timeline', params.id);
  }, [client, user, params.id, ownTimeline]);

  useEffect(() => {
    if (!feed || !timeline) {
      return;
    }

    initializeFeed(feed, {
      watch: true,
      followers_pagination: { limit: 1 },
    }).catch((error) => {
      logErrorAndDisplayNotification(
        error,
        error instanceof Error
          ? error.message
          : `Failed to initialize feed: ${feed.fid}`,
      );
    });
    initializeFeed(timeline, {
      watch: true,
      following_pagination: { limit: 1 },
    }).catch((error) => {
      logErrorAndDisplayNotification(
        error,
        error instanceof Error
          ? error.message
          : `Failed to initialize feed: ${timeline.fid}`,
      );
    });
  }, [feed, logErrorAndDisplayNotification, timeline]);

  if (!feed || !timeline) {
    return <LoadingIndicator color="blue" />;
  }

  return (
    <>
      <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full">
          <FeedMetadata userFeed={feed} timelineFeed={timeline}></FeedMetadata>
        </div>
        <NewActivity feed={feed} />
        <Feed feed={feed}></Feed>
      </div>
    </>
  );
}
