import {
  useFeedsClient,
  ActivityResponse,
  Feed,
} from '@stream-io/feeds-react-sdk';
import { useState, useCallback, useEffect } from 'react';
import { ActivitySearchResult } from '../components/activity/ActivitySearchResult';
import { FeedSearchResult } from '../components/FeedSearchResult';

export const SearchResults = ({ searchQuery }: { searchQuery: string }) => {
  const client = useFeedsClient();
  const [activitySearchResults, setActivitySearchResults] = useState<
    ActivityResponse[]
  >([]);
  const [feedSearchResults, setFeedSearchResults] = useState<Feed[]>([]);
  const [nextActivities, setNextActivities] = useState<string | undefined>(
    undefined,
  );
  const [nextFeeds, setNextFeeds] = useState<string | undefined>(undefined);

  const searchActivities = useCallback(async () => {
    if (!client) return;
    const result = await client.queryActivities({
      filter: {
        text: { $q: searchQuery },
      },
      limit: 10,
      next: nextActivities,
    });
    setActivitySearchResults((current) => [
      ...(nextActivities ? current : []),
      ...result.activities,
    ]);
    setNextActivities(result.next);
  }, [client, searchQuery, nextActivities]);

  const searchFeeds = useCallback(async () => {
    if (!client) return;
    const result = await client.queryFeeds({
      filter: {
        group_id: 'user',
        ['created_by.name']: { $q: searchQuery },
      },
      limit: 10,
      next: nextFeeds,
    });
    setFeedSearchResults((current) => [
      ...(nextFeeds ? current : []),
      ...result.feeds,
    ]);
    setNextFeeds(result.next);
  }, [client, searchQuery, nextFeeds]);

  useEffect(() => {
    if (searchQuery) {
      searchActivities();
      searchFeeds();
    }
  }, [searchQuery, searchActivities, searchFeeds]);

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <div className="text-lg font-bold">Search</div>

      <div className="w-full tabs tabs-border">
        <input
          type="radio"
          name="my_tabs"
          className="tab"
          aria-label="Activities"
          defaultChecked
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="w-full flex flex-col items-center justify-start gap-4">
            {activitySearchResults.length === 0 && <NoResults />}
            {activitySearchResults.length > 0 && (
              <>
                {activitySearchResults.map((activity) => (
                  <ActivitySearchResult activity={activity} key={activity.id} />
                ))}
              </>
            )}
            {nextActivities && (
              <button
                className="btn btn-soft btn-primary"
                onClick={searchActivities}
              >
                Load more
              </button>
            )}
          </div>
        </div>

        <input type="radio" name="my_tabs" className="tab" aria-label="Feeds" />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <div className="w-full flex flex-col items-center justify-start gap-4">
            {feedSearchResults.length === 0 && <NoResults />}
            {feedSearchResults.length > 0 && (
              <>
                {feedSearchResults.map((feed) => (
                  <FeedSearchResult feed={feed.currentState} key={feed.feed} />
                ))}
              </>
            )}
            {nextFeeds && (
              <button
                className="btn btn-soft btn-primary"
                onClick={searchFeeds}
              >
                Load more
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
