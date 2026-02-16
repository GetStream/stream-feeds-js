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
          <button
            type="button"
            role="tab"
            className={`tab ${activeTab === 'places' ? 'tab-active' : ''}`}
            aria-selected={activeTab === 'places'}
            onClick={() => setActiveTab('places')}
          >
            Places
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
        {activeTab === 'places' && (
          <div className="w-full flex flex-col items-center justify-start gap-4 pt-4">
            {searchQuery && isPlacesLoading && placesSearchResults.length === 0 && (
              <SearchResultsSkeleton tab="activities" />
            )}
            {!isPlacesLoading && placesSearchResults.length === 0 && !placesError && searchQuery && <NoResultsForPlaces />}
            {!isPlacesLoading && placesError && <ErrorCard message="Failed to load places" error={placesError} />}
            {placesSearchResults.length > 0 && (
              <ul className="list w-full">
                {placesSearchResults.map((activity) => (
                  <li className="list-row w-full" key={activity.id}>
                    <div className="list-col-grow w-full min-w-0">
                      <ActivitySearchResult activity={activity} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {nextPlaces && (
              <button
                className="btn btn-soft btn-primary"
                onClick={() => searchPlaces(nextPlaces)}
              >
                {isPlacesLoading ? <LoadingIndicator className="loading-lg" /> : 'Load more'}
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

const NoResultsForPlaces = () => {
  return (
    <div className="card card-border bg-base-100 w-96">
      <div className="card-body items-center text-center">
        <h2 className="card-title">No results found</h2>
        <p>Try searching for Amsterdam or Boulder, or add a new activity with location.</p>
      </div>
    </div>
  );
};