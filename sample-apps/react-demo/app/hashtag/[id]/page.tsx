'use client';

import type { Feed, FeedState } from '@stream-io/feeds-react-sdk';
import {
  StreamFeed,
  useFeedActivities,
  useFeedsClient,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ActivityList } from '../../components/activity/ActivityList';
import { HashtagPageSkeleton } from '../../components/utility/loading-skeletons/HashtagPageSkeleton';
import { PageHeader } from '../../components/utility/PageHeader';

const hashtagFeedSelector = (state: FeedState) => ({
  activityCount: state.activity_count ?? 0,
});

export default function Hashtag() {
  const hashtagId = useParams<{ id: string }>().id;
  const client = useFeedsClient();
  const [feed, setFeed] = useState<Feed | undefined>();
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!hashtagId || !client) {
      setFeed(undefined);
      setError(undefined);
      return;
    }

    const _feed = client.feed('hashtag', hashtagId);
    _feed.getOrCreate().catch((e) => {
      setError(e);
      throw e;
    });
    setFeed(_feed);
  }, [hashtagId, client]);

  const { activityCount } = useStateStore(feed?.state, hashtagFeedSelector) ?? {
    activityCount: 0,
  };

  const { activities, is_loading } = useFeedActivities(feed);

  const isLoading = hashtagId && (!feed || (is_loading && activities?.length === 0));

  if (isLoading) {
    return <HashtagPageSkeleton />;
  }

  return (
    <div className="w-full flex flex-col">
      <PageHeader title={`#${hashtagId}`}>
        <span className="text-sm text-base-content/70">{activityCount} {activityCount === 1 ? 'post' : 'posts'}</span>
      </PageHeader>
      {feed && (
        <StreamFeed feed={feed}>
          <ActivityList location="profile" error={error} />
        </StreamFeed>
      )}
    </div>
  );
}
