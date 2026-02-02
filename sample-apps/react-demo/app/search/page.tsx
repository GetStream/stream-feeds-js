'use client';

import type { ActivityResponse, Feed } from '@stream-io/feeds-react-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useState, useCallback, useEffect, useRef } from 'react';
import { FeedSearchResult } from '../components/FeedSearchResult';
import { useSearchParams } from 'next/navigation';
import { NavLink } from '../components/utility/NavLink';
import { ActivitySearchResult } from '../components/activity/ActivitySearchResult';
import { SearchResultsSkeleton } from '../components/utility/loading-skeletons/SearchPageSkeleton';
import { LoadingIndicator } from '../components/utility/LoadingIndicator';
import { ErrorCard } from '../components/utility/ErrorCard';

type SearchTab = 'activities' | 'feeds';

export default function SearchResults() {
  const searchQuery = useSearchParams().get('q');
  const client = useFeedsClient();
  const [activeTab, setActiveTab] = useState<SearchTab>('activities');
  const hasSetInitialTab = useRef(false);
  const [activitySearchResults, setActivitySearchResults] = useState<
    ActivityResponse[]
  >([]);
  const [feedSearchResults, setFeedSearchResults] = useState<Feed[]>([]);
  const [nextActivities, setNextActivities] = useState<string | undefined>(
    undefined,
  );
  const [nextFeeds, setNextFeeds] = useState<string | undefined>(undefined);
  const [activityError, setActivityError] = useState<Error | undefined>(undefined);
  const [feedError, setFeedError] = useState<Error | undefined>(undefined);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [isFeedsLoading, setIsFeedsLoading] = useState(true);

  const searchActivities = useCallback(async (next?: string) => {
    if (!client) return;
    try {
      setIsActivitiesLoading(true);
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
    } catch (error) {
      setActivityError(error as Error);
      throw error;
    } finally {
      setIsActivitiesLoading(false);
    }
  }, [client, searchQuery]);

  const searchFeeds = useCallback(async (next?: string) => {
    if (!client) return;
    try {
      setIsFeedsLoading(true);
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
    } catch (error) {
      setFeedError(error as Error);
      throw error;
    } finally {
      setIsFeedsLoading(false);
    }
  }, [client, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setActivitySearchResults([]);
      setNextActivities(undefined);
      setFeedSearchResults([]);
      setNextFeeds(undefined);
      searchActivities();
      searchFeeds();
    } else {
      setIsActivitiesLoading(false);
      setIsFeedsLoading(false);
    }
  }, [searchQuery, searchActivities, searchFeeds]);

  // Reset initial-tab logic when search query changes
  useEffect(() => {
    hasSetInitialTab.current = false;
  }, [searchQuery]);

  // When both searches have finished, select first tab (activities) unless
  // activities returned 0 results and feeds has results — then select feeds
  useEffect(() => {
    if (hasSetInitialTab.current || isActivitiesLoading || isFeedsLoading) return;
    hasSetInitialTab.current = true;
    if (activitySearchResults.length === 0 && feedSearchResults.length > 0) {
      setActiveTab('feeds');
    } else {
      setActiveTab('activities');
    }
  }, [
    isActivitiesLoading,
    isFeedsLoading,
    activitySearchResults.length,
    feedSearchResults.length,
  ]);

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

      <div className="w-full">
        <div role="tablist" className="tabs tabs-border">
          <button
            type="button"
            role="tab"
            className={`tab ${activeTab === 'activities' ? 'tab-active' : ''}`}
            aria-selected={activeTab === 'activities'}
            onClick={() => setActiveTab('activities')}
          >
            Activities
          </button>
          <button
            type="button"
            role="tab"
            className={`tab ${activeTab === 'feeds' ? 'tab-active' : ''}`}
            aria-selected={activeTab === 'feeds'}
            onClick={() => setActiveTab('feeds')}
          >
            Feeds
          </button>
        </div>
        {activeTab === 'activities' && (
          <div className="w-full flex flex-col items-center justify-start gap-4 pt-4">
            {searchQuery && isActivitiesLoading && activitySearchResults.length === 0 && (
              <SearchResultsSkeleton tab="activities" />
            )}
            {!isActivitiesLoading && activitySearchResults.length === 0 && !activityError && searchQuery && <NoResults />}
            {!isActivitiesLoading && activityError && <ErrorCard message="Failed to load activities" error={activityError} />}
            {activitySearchResults.length > 0 && (
              <ul className="list w-full">
                {activitySearchResults.map((activity) => (
                  <li className="list-row w-full" key={activity.id}>
                    <div className="list-col-grow w-full min-w-0">
                      <ActivitySearchResult activity={activity} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {nextActivities && (
              <button
                className="btn btn-soft btn-primary"
                onClick={() => searchActivities(nextActivities)}
              >
                {isActivitiesLoading ? <LoadingIndicator className="loading-lg" /> : 'Load more'}
              </button>
            )}
          </div>
        )}
        {activeTab === 'feeds' && (
          <div className="w-full flex flex-col items-center justify-start gap-4 pt-4">
            {searchQuery && isFeedsLoading && feedSearchResults.length === 0 && (
              <SearchResultsSkeleton tab="feeds" />
            )}
            {!isFeedsLoading && feedSearchResults.length === 0 && !feedError && searchQuery && <NoResults />}
            {!isFeedsLoading && feedError && <ErrorCard message="Failed to load feeds" error={feedError} />}
            {feedSearchResults.length > 0 && (
              <ul className="list w-full">
                {feedSearchResults.map((feed) => (
                  <li className="list-row w-full" key={feed.feed}>
                    <div className="list-col-grow w-full min-w-0">
                      <FeedSearchResult feed={feed} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {nextFeeds && (
              <button
                className="btn btn-soft btn-primary"
                onClick={() => searchFeeds(nextFeeds)}
              >
                {isFeedsLoading ? <LoadingIndicator className="loading-lg" /> : 'Load more'}
              </button>
            )}
          </div>
        )}
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
