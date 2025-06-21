'use client';
import { FeedMetadata } from '@/app/components/FeedMetadata';
import { useFeedContext } from '../../feed-context';
import { useMemo } from 'react';
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

  const feed = useMemo(() => {
    if (!client || !user) return undefined;

    if (user?.id === params.id) {
      return ownFeed;
    }

    return client?.feed('user', params.id);
  }, [ownFeed, params.id, user?.id, client]);

  const timeline = useMemo(() => {
    if (!client || !user) return undefined;

    if (user?.id === params.id) {
      return ownTimeline;
    }

    return client?.feed('timeline', params.id);
  }, [ownFeed, params.id, user?.id, client]);

  if (!feed || !timeline) {
    return <LoadingIndicator color="blue" />;
  }

  return (
    <>
      <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full">
          <FeedMetadata feed={feed} timeline={timeline}></FeedMetadata>
        </div>
        <NewActivity feed={feed} />
        <Feed feed={feed} onNewPost="show-immediately"></Feed>
      </div>
    </>
  );
}
