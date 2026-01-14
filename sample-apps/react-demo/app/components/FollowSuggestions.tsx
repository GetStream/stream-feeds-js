import { useEffect } from 'react';
import { FeedSearchResult } from './FeedSearchResult';
import { useFollowSuggestionsContext } from '../follow-suggestions-context';

export const FollowSuggestions = () => {
  const { suggestions, loadSuggestions } = useFollowSuggestionsContext();

  useEffect(() => {
    if (suggestions.length === 0) {
      loadSuggestions();
    }
  }, [suggestions.length, loadSuggestions]);

  return (
    <div className="md:card md:card-border md:bg-base-200">
      <div className="md:card-body">
        <h2 className="card-title hidden md:block">Who to follow?</h2>
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
