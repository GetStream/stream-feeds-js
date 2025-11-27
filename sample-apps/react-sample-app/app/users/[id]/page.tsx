'use client';
import { FeedMetadata } from '@/app/components/FeedMetadata';
import { useOwnFeedsContext } from '../../own-feeds-context';
import { useEffect, useMemo, useState } from 'react';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { useParams } from 'next/navigation';
import { NewActivity } from '@/app/components/NewActivity';
import { Feed } from '@/app/components/Feed';
import { useErrorContext } from '@/app/error-context';
import {
  StreamFeed,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingIndicator color="blue" />;
  }

  return <ProfilePageContent />;
}

function ProfilePageContent() {
  const params = useParams<{ id: string }>();
  const user = useClientConnectedUser();
  const client = useFeedsClient();
  const { ownFeed, ownTimeline } = useOwnFeedsContext();
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

    // Our own feeds are initialized in the OwnFeedsContextProvider
    if (user?.id !== params.id) {
      feed
        .getOrCreate({
          watch: true,
          followers_pagination: { limit: 10 },
        })
        .catch(logErrorAndDisplayNotification);
      timeline
        .getOrCreate({
          watch: true,
          following_pagination: { limit: 10 },
        })
        .catch(logErrorAndDisplayNotification);
    }

    return () => {
      if (
        user &&
        user.id !== params.id &&
        feed &&
        feed.state.getLatestValue().watch
      ) {
        client?.stopWatchingFeed({
          feed_group_id: feed.group,
          feed_id: feed.id,
        });
      }

      if (
        user &&
        user.id !== params.id &&
        timeline &&
        timeline.state.getLatestValue().watch
      ) {
        client?.stopWatchingFeed({
          feed_group_id: timeline.group,
          feed_id: timeline.id,
        });
      }
    };
  }, [feed, logErrorAndDisplayNotification, timeline, user, params.id, client]);

  if (!feed || !timeline) {
    return <LoadingIndicator color="blue" />;
  }

  return (
    <>
      <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full">
          <FeedMetadata timelineFeed={timeline} userFeed={feed} />
        </div>
        <StreamFeed feed={feed}>
          <NewActivity />
          <Feed />
        </StreamFeed>
      </div>
    </>
  );
}
