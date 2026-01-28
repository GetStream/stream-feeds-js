import { useEffect } from 'react';
import { FeedSearchResult } from './FeedSearchResult';
import { useFollowSuggestionsContext } from '../follow-suggestions-context';

export const FollowSuggestions = () => {
  const { suggestedFeeds, loadFollowSuggestions } =
    useFollowSuggestionsContext();

  useEffect(() => {
    if (suggestedFeeds.length === 0) {
      loadFollowSuggestions();
    }
  }, [suggestedFeeds.length, loadFollowSuggestions]);

  return (
    <div className="md:card md:card-border md:bg-base-200">
      <div className="md:card-body">
        <h2 className="card-title hidden md:block">Who to follow?</h2>
        <div className="w-full flex flex-col items-center justify-stretch gap-2 overflow-hidden">
          {suggestedFeeds.length === 0 ? (
            <p>No suggestions</p>
          ) : (
            suggestedFeeds.map((feed) => (
              <FeedSearchResult feed={feed} key={feed.feed} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
