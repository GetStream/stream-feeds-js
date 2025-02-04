'use client';
import { useEffect, useState } from 'react';
import { StreamFlatFeedClient } from '@stream-io/feeds-client';
import { useUserContext } from '@/app/user-context';
import { useErrorContext } from '@/app/error-context';
import { LoadingIndicator } from '@/app/components/LoadingIndicator';
import { useParams } from 'next/navigation';
import { NewActivity } from '@/app/components/NewActivity';
import { Feed } from '@/app/components/Feed';
import { FeedMetadata } from '@/app/components/FeedMetadata';

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { logErrorAndDisplayNotification } = useErrorContext();
  const { client } = useUserContext();
  const [page, setPage] = useState<StreamFlatFeedClient>();

  useEffect(() => {
    if (!client) {
      setPage(undefined);
    } else {
      client
        .queryFeeds({
          filter: {
            feed_id: params.id,
            feed_group: 'page',
          },
        })
        .then((response) => {
          response.feeds.forEach((feed) => {
            if (
              feed.type === 'flat' &&
              feed.state.getLatestValue().group === 'page'
            ) {
              setPage(feed);
            }
          });
        })
        .catch((error) => {
          logErrorAndDisplayNotification(
            error,
            `Couldn't load data, this could've been a temproray issue, please retry`,
          );
        });
    }
  }, [params.id, client]);

  if (!page) {
    return <LoadingIndicator color="blue"></LoadingIndicator>;
  }

  return (
    <>
      <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full">
          <FeedMetadata feed={page}></FeedMetadata>
        </div>
        <NewActivity feed={page}></NewActivity>
        <Feed feed={page} onNewPost="show-immediately"></Feed>
      </div>
    </>
  );
}
