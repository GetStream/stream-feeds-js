'use client';

import { StreamFeed } from '@stream-io/feeds-react-sdk';
import { ActivityList } from '../components/activity/ActivityList';
import { FollowSuggestions } from '../components/FollowSuggestions';
import { SearchInput } from '../components/utility/SearchInput';
import { useOwnFeedsContext } from '../own-feeds-context';

export default function Explore() {
  const { ownForyouFeed } = useOwnFeedsContext();

  return (
    <div className="flex flex-col items-stretch justify-center gap-4">
      <div className="lg:hidden w-full flex flex-col items-stretch justify-center gap-4">
        <SearchInput />
        <div className="text-md font-bold md:hidden">Follow suggestions</div>
        <FollowSuggestions />
      </div>
      {ownForyouFeed && (
        <StreamFeed feed={ownForyouFeed}>
          <div className="text-md font-bold lg:hidden">Popular posts</div>
          <ActivityList location="foryou" />
        </StreamFeed>
      )}
    </div>
  );
}
