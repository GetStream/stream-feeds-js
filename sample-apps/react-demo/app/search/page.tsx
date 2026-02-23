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
import { getCoordsFromCity } from '../utility/geocoding';

type SearchTab = 'activities' | 'feeds' | 'places';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const tabParam = searchParams.get('tab');
  const client = useFeedsClient();
  const isValidTab = (tab: string | null): tab is SearchTab =>
    tab === 'activities' || tab === 'feeds' || tab === 'places';
  const [activeTab, setActiveTab] = useState<SearchTab>(isValidTab(tabParam) ? tabParam : 'activities');
  const hasSetInitialTab = useRef(false);
  const [activitySearchResults, setActivitySearchResults] = useState<
    ActivityResponse[]
  >([]);
  const [feedSearchResults, setFeedSearchResults] = useState<Feed[]>([]);
  const [nextActivities, setNextActivities] = useState<string | undefined>(
    undefined,
  );
  const [nextFeeds, setNextFeeds] = useState<string | undefined>(undefined);
  const [placesSearchResults, setPlacesSearchResults] = useState<
    ActivityResponse[]
  >([]);
  const [nextPlaces, setNextPlaces] = useState<string | undefined>(undefined);
  const [activityError, setActivityError] = useState<Error | undefined>(undefined);
  const [feedError, setFeedError] = useState<Error | undefined>(undefined);
  const [placesError, setPlacesError] = useState<Error | undefined>(undefined);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [isFeedsLoading, setIsFeedsLoading] = useState(true);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);
  const placesSearchedForQuery = useRef<string | null>(null);
  const placesCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

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
          $or: [
            {
              group_id: 'user',
              ['created_by.name']: { $q: searchQuery },
            },
            {
              group_id: 'hashtag',
              name: { $q: searchQuery },
            },
          ],
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

  const searchPlaces = useCallback(async (next?: string) => {
    if (!client || !searchQuery) return;
    try {
      setIsPlacesLoading(true);
      setPlacesError(undefined);
      // Only geocode when starting a new search (no pagination); use cached coords for "Load more"
      let coords: { lat: number; lon: number } | null = next ? placesCoordsRef.current : null;
      if (!coords) {
        coords = await getCoordsFromCity(searchQuery);
        if (!coords) {
          setPlacesSearchResults(next ? (current) => current : []);
          setNextPlaces(undefined);
          return;
        }
        placesCoordsRef.current = coords;
        placesSearchedForQuery.current = searchQuery;
      }
      const result = await client.queryActivities({
        filter: {
          near: { $eq: { lat: coords.lat, lng: coords.lon, distance: 20 } },
        },
        limit: 10,
        next,
      });
      setPlacesSearchResults((current) => [
        ...(next ? current : []),
        ...result.activities,
      ]);
      setNextPlaces(result.next);
    } catch (error) {
      setPlacesError(error as Error);
    } finally {
      setIsPlacesLoading(false);
    }
  }, [client, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setActivitySearchResults([]);
      setNextActivities(undefined);
      setFeedSearchResults([]);
      setNextFeeds(undefined);
      setPlacesSearchResults([]);
      setNextPlaces(undefined);
      placesSearchedForQuery.current = null;
      placesCoordsRef.current = null;
      searchActivities();
      searchFeeds();
    } else {
      setIsActivitiesLoading(false);
      setIsFeedsLoading(false);
    }
  }, [searchQuery, searchActivities, searchFeeds]);

  // Trigger places search only when the Places tab is selected
  useEffect(() => {
    if (activeTab === 'places' && searchQuery && placesSearchedForQuery.current !== searchQuery) {
      searchPlaces();
    }
  }, [activeTab, searchQuery, searchPlaces]);

  // Reset initial-tab logic when search query changes
  useEffect(() => {
    hasSetInitialTab.current = false;
  }, [searchQuery]);

  // When both searches have finished, select first tab (activities) unless
  // activities returned 0 results and feeds has results — then select feeds.
  // If a tab query param is provided, respect it.
  useEffect(() => {
    if (hasSetInitialTab.current || isActivitiesLoading || isFeedsLoading) return;
    hasSetInitialTab.current = true;
    if (isValidTab(tabParam)) {
      setActiveTab(tabParam);
    } else if (activitySearchResults.length === 0 && feedSearchResults.length > 0) {
      setActiveTab('feeds');
    } else {
      setActiveTab('activities');
    }
  }, [
    isActivitiesLoading,
    isFeedsLoading,
    activitySearchResults.length,
    feedSearchResults.length,
    tabParam,
  ]);

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex items-center px-4 py-3 border-b border-base-content/10 sticky top-0 bg-base-100 z-10">
        <NavLink href="/explore" className="lg:hidden mr-3">
          <span className="material-symbols-outlined text-[22px]!">arrow_back</span>
        </NavLink>
        <div className="text-base font-semibold">Search</div>
        <div role="tablist" className="flex items-center gap-1 ml-auto">
          {(['activities', 'feeds', 'places'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              className={`px-3 py-1.5 text-[13px] font-semibold rounded-full transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-base-content text-base-100'
                  : 'text-base-content/70 hover:bg-base-200'
              }`}
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'activities' && (
        <SearchTabContent
          isLoading={isActivitiesLoading}
          results={activitySearchResults}
          error={activityError}
          searchQuery={searchQuery}
          next={nextActivities}
          onLoadMore={() => searchActivities(nextActivities)}
          renderItem={(activity) => (
            <li className="w-full px-4 py-3 border-b border-base-content/10" key={activity.id}>
              <ActivitySearchResult activity={activity} />
            </li>
          )}
          skeletonTab="activities"
          noResultsMessage="Try searching for something else."
        />
      )}

      {activeTab === 'feeds' && (
        <SearchTabContent
          isLoading={isFeedsLoading}
          results={feedSearchResults}
          error={feedError}
          searchQuery={searchQuery}
          next={nextFeeds}
          onLoadMore={() => searchFeeds(nextFeeds)}
          renderItem={(feed) => (
            <li key={feed.feed}>
              <FeedSearchResult feed={feed} showFollowsYouBadge />
            </li>
          )}
          skeletonTab="feeds"
          noResultsMessage="Try searching for something else."
        />
      )}

      {activeTab === 'places' && (
        <SearchTabContent
          isLoading={isPlacesLoading}
          results={placesSearchResults}
          error={placesError}
          searchQuery={searchQuery}
          next={nextPlaces}
          onLoadMore={() => searchPlaces(nextPlaces)}
          renderItem={(activity) => (
            <li className="w-full px-4 py-3 border-b border-base-content/10" key={activity.id}>
              <ActivitySearchResult activity={activity} />
            </li>
          )}
          skeletonTab="activities"
          noResultsMessage="Try searching for Amsterdam or Boulder, or add a new activity with location."
        />
      )}
    </div>
  );
}

function SearchTabContent<T>({
  isLoading,
  results,
  error,
  searchQuery,
  next,
  onLoadMore,
  renderItem,
  skeletonTab,
  noResultsMessage,
}: {
  isLoading: boolean;
  results: T[];
  error: Error | undefined;
  searchQuery: string | null;
  next: string | undefined;
  onLoadMore: () => void;
  renderItem: (item: T) => React.ReactNode;
  skeletonTab: 'activities' | 'feeds';
  noResultsMessage: string;
}) {
  return (
    <div className="w-full flex flex-col items-center">
      {searchQuery && isLoading && results.length === 0 && (
        <SearchResultsSkeleton tab={skeletonTab} />
      )}
      {!isLoading && results.length === 0 && !error && searchQuery && (
        <div className="w-full max-w-sm mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-semibold mb-2">No results found</h2>
          <p className="text-base-content/60">{noResultsMessage}</p>
        </div>
      )}
      {!isLoading && error && <ErrorCard message="Failed to load results" error={error} />}
      {results.length > 0 && (
        <ul className="w-full">
          {results.map((item) => renderItem(item))}
        </ul>
      )}
      {next && (
        <button
          className="my-4 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
          onClick={onLoadMore}
        >
          {isLoading ? <LoadingIndicator /> : 'Load more'}
        </button>
      )}
    </div>
  );
}
