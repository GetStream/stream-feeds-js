import type {
  FeedSuggestionResponse} from '@stream-io/feeds-react-sdk';
import {
  useFeedsClient
} from '@stream-io/feeds-react-sdk';
import { useState, useEffect } from 'react';
import { FeedSearchResult } from './FeedSearchResult';

export const FollowSuggestions = () => {
  const client = useFeedsClient();
  const [suggestions, setSuggestions] = useState<FeedSuggestionResponse[]>([]);

  useEffect(() => {
    if (!client) return;
    client
      .getFollowSuggestions({
        feed_group_id: 'user',
        limit: 3,
      })
      .then((response) => setSuggestions(response.suggestions));
  }, [client]);

  return (
    <div className="card card-border bg-base-200">
      <div className="card-body">
        <h2 className="card-title">Who to follow?</h2>
        <div className="w-full flex flex-col items-center justify-start gap-2">
          {suggestions.length === 0 ? (
            <p>No suggestions</p>
          ) : (
            suggestions.map((suggestion) => (
              <FeedSearchResult feed={suggestion} key={suggestion.feed} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
