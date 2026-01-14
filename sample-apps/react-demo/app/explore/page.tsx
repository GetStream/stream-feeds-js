'use client';

import {
  useFeedsClient,
  useClientConnectedUser,
  StreamFeed,
} from '@stream-io/feeds-react-sdk';
import { useEffect, useMemo } from 'react';
import { ActivityList } from '../components/activity/ActivityList';
import { FollowSuggestions } from '../components/FollowSuggestions';
import { SearchInput } from '../components/SearchInput';

export default function Explore() {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();
  const feed = useMemo(() => {
    if (!currentUser?.id || !client) {
      return undefined;
    }
    return client.feed('foryou', currentUser.id);
  }, [client, currentUser?.id]);

  useEffect(() => {
    if (feed) {
      feed.getOrCreate({ limit: 10 });
    }
  }, [feed]);

  if (!feed) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch justify-center gap-4">
      <div className="md:hidden w-full flex flex-col items-stretch justify-center gap-4">
        <SearchInput />
        <div className="text-md font-bold md:hidden">Follow suggestions</div>
        <FollowSuggestions />
      </div>
      <StreamFeed feed={feed}>
        <div className="text-md font-bold md:hidden">Popular posts</div>
        <ActivityList />
      </StreamFeed>
    </div>
  );
}
