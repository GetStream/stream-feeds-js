'use client';

import { StreamFeed, useFeedActivities } from '@stream-io/feeds-react-sdk';
import { ActivityList } from '../components/activity/ActivityList';
import { FollowSuggestions } from '../components/FollowSuggestions';
import { SearchInput } from '../components/utility/SearchInput';
import { ActivitySkeleton } from '../components/utility/loading-skeletons/ActivitySkeleton';
import { PageHeader } from '../components/utility/PageHeader';
import { useOwnFeedsContext } from '../own-feeds-context';

export default function Explore() {
  const { ownForyouFeed, errors } = useOwnFeedsContext();
  const { activities, is_loading } = useFeedActivities(ownForyouFeed ?? undefined);
  const showActivityListSkeleton =
    !ownForyouFeed || (is_loading && activities?.length === 0);

  return (
    <div className="w-full flex flex-col">
      <div className="lg:hidden w-full flex flex-col gap-4 px-4 py-3 border-b border-base-content/10">
        <SearchInput />
        <FollowSuggestions />
      </div>
      <PageHeader title="Popular" />
      {showActivityListSkeleton ? (
        <div className="w-full flex flex-col">
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
        </div>
      ) : (
        <StreamFeed feed={ownForyouFeed}>
          <ActivityList location="foryou" error={errors.ownForyouFeed} />
        </StreamFeed>
      )}
    </div>
  );
}
