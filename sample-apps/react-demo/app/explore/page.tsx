'use client';

import { StreamFeed, useFeedActivities } from '@stream-io/feeds-react-sdk';
import { ActivityList } from '../components/activity/ActivityList';
import { FollowSuggestions } from '../components/FollowSuggestions';
import { SearchInput } from '../components/utility/SearchInput';
import { ActivitySkeleton } from '../components/utility/loading-skeletons/ActivitySkeleton';
import { useOwnFeedsContext } from '../own-feeds-context';

export default function Explore() {
  const { ownForyouFeed, errors } = useOwnFeedsContext();
  const { activities, is_loading } = useFeedActivities(ownForyouFeed ?? undefined);
  const showActivityListSkeleton =
    !ownForyouFeed || (is_loading && activities?.length === 0);

  return (
    <div className="flex flex-col items-stretch justify-center gap-4">
      <div className="lg:hidden w-full flex flex-col items-stretch justify-center gap-4">
        <SearchInput />
        <FollowSuggestions />
      </div>
      <div className="text-xl font-extrabold lg:hidden lg:px-0">Popular posts</div>
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
