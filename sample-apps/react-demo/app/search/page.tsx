'use client';

import type { ActivityResponse, Feed } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useState, useCallback, useEffect } from 'react';
import { FeedSearchResult } from '../components/FeedSearchResult';
import { useSearchParams } from 'next/navigation';
import { NavLink } from '../components/utility/NavLink';
import { ActivitySearchResult } from '../components/activity/ActivitySearchResult';

export default function SearchResults() {
  const searchQuery = useSearchParams().get('q');
  const client = useFeedsClient();
  const [activitySearchResults, setActivitySearchResults] = useState<
    ActivityResponse[]
  >([]);
  const [feedSearchResults, setFeedSearchResults] = useState<Feed[]>([]);
  const [nextActivities, setNextActivities] = useState<string | undefined>(
    undefined,
  );
  const [nextFeeds, setNextFeeds] = useState<string | undefined>(undefined);

  const searchActivities = useCallback(async (next?: string) => {
    if (!client) return;
    const result = await client.queryActivities({
      filter: {
        text: { $q: searchQuery },
      },
      limit: 10,
      next,
    });
    setActivitySearchResults((current) => [
      ...(next ? current : []),
      ...result.activities,
    ]);
    setNextActivities(result.next);
  }, [client, searchQuery]);

  const searchFeeds = useCallback(async (next?: string) => {
    if (!client) return;
    const result = await client.queryFeeds({
      filter: {
        group_id: 'user',
        ['created_by.name']: { $q: searchQuery },
      },
      limit: 10,
      next,
    });
    setFeedSearchResults((current) => [
      ...(next ? current : []),
      ...result.feeds,
    ]);
    setNextFeeds(result.next);
  }, [client, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      searchActivities();
      searchFeeds();
    }
  }, [searchQuery, searchActivities, searchFeeds]);

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <div className="w-full flex flex-row items-center justify-start gap-4">
        <div className="block lg:hidden">
          <NavLink href="/explore">
            <span className="material-symbols-outlined">arrow_back</span>
          </NavLink>
        </div>
        <div className="text-lg font-bold">Search</div>
      </div>

      <div className="w-full tabs tabs-border">
        <input
          type="radio"
          name="my_tabs"
          className="tab"
          aria-label="Activities"
          defaultChecked
        />
        <div className="tab-content">
          <div className="w-full flex flex-col items-center justify-start gap-4">
            {activitySearchResults.length === 0 && <NoResults />}
            {activitySearchResults.length > 0 && (
              <div className="list w-full">
                {activitySearchResults.map((activity) => (
                  <li className="list-row w-full" key={activity.id}><ActivitySearchResult activity={activity} /></li>
                ))}
              </div>
            )}
            {nextActivities && (
              <button
                className="btn btn-soft btn-primary"
                onClick={() => searchActivities(nextActivities)}
              >
                Load more
              </button>
            )}
          </div>
        </div>

        <input type="radio" name="my_tabs" className="tab" aria-label="Feeds" />
        <div className="tab-content">
          <div className="w-full flex flex-col items-center justify-start gap-4">
            {feedSearchResults.length === 0 && <NoResults />}
            {feedSearchResults.length > 0 && (
              <div className="list w-full">
                {feedSearchResults.map((feed) => (
                  <li className="list-row w-full flex flex-row justify-stretch items-stretch" key={feed.feed}><FeedSearchResult feed={feed} /></li>
                ))}
              </div>
            )}
            {nextFeeds && (
              <button
                className="btn btn-soft btn-primary"
                onClick={() => searchFeeds(nextFeeds)}
              >
                Load more
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const NoResults = () => {
  return (
    <div className="card card-border bg-base-100 w-96">
      <div className="card-body items-center text-center">
        <h2 className="card-title">No results found</h2>
        <p>Try searching for something else.</p>
      </div>
    </div>
  );
};
