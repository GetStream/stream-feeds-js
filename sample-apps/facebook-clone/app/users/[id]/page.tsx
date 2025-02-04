'use client';
import { FeedMetadata } from '@/app/components/FeedMetadata';
import { useFeedContext } from '../../feed-context';
import { useEffect, useState } from 'react';
import { StreamFlatFeedClient } from '@stream-io/feeds-client';
import { useUserContext } from '@/app/user-context';
import { useErrorContext } from '@/app/error-context';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { useParams } from 'next/navigation';
import { NewActivity } from '@/app/components/NewActivity';
import { Feed } from '@/app/components/Feed';

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { logErrorAndDisplayNotification } = useErrorContext();
  const { user, client } = useUserContext();
  const { ownFeed, ownTimeline } = useFeedContext();
  const [feed, setFeed] = useState<StreamFlatFeedClient>();
  const [timeline, setTimeline] = useState<StreamFlatFeedClient>();

  useEffect(() => {
    if (!user || !client) {
      setFeed(undefined);
      setTimeline(undefined);
    } else {
      if (user.id === params.id) {
        setFeed(ownFeed);
        setTimeline(ownTimeline);
      } else {
        client
          .queryFeeds({
            filter: {
              feed_id: params.id,
              feed_group: { $in: ['user', 'timeline'] },
            },
          })
          .then((response) => {
            response.feeds.forEach((feed) => {
              if (
                feed.type === 'flat' &&
                feed.state.getLatestValue().group === 'user'
              ) {
                setFeed(feed);
              } else if (
                feed.type === 'flat' &&
                feed.state.getLatestValue().group === 'timeline'
              ) {
                setTimeline(feed);
              }
            });
          })
          .catch((error) => {
            logErrorAndDisplayNotification(error, (error as Error).message);
          });
      }
    }
  }, [params.id, user, ownFeed, ownTimeline, client]);

  if (!feed || !timeline) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  return (
    <>
      <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full">
          <FeedMetadata feed={feed} timeline={timeline}></FeedMetadata>
        </div>
        <NewActivity feed={feed}></NewActivity>
        <Feed feed={feed} onNewPost="show-immediately"></Feed>
      </div>
    </>
  );
}
