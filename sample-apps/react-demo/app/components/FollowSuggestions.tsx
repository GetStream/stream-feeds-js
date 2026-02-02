import { useEffect } from 'react';
import { FeedSearchResult } from './FeedSearchResult';
import { useFollowSuggestionsContext } from '../follow-suggestions-context';
import { FollowSuggestionSkeleton } from './utility/loading-skeletons/FollowSuggestionSkeleton';

export const FollowSuggestions = () => {
  const { suggestedFeeds, loadFollowSuggestions, isLoading } =
    useFollowSuggestionsContext();

  useEffect(() => {
    if (suggestedFeeds.length === 0) {
      loadFollowSuggestions();
    }
  }, [suggestedFeeds.length, loadFollowSuggestions]);

  return (
    <div className="bg-base-200 rounded-2xl overflow-hidden border border-transparent dark:border-base-content/20">
      <div className="p-4">
        <h2 className="text-xl font-extrabold mb-4">
          Who to follow
        </h2>
        <div className="w-full flex flex-col">
          {isLoading ? (
            <>
              <FollowSuggestionSkeleton />
              <FollowSuggestionSkeleton />
              <FollowSuggestionSkeleton />
            </>
          ) : suggestedFeeds.length === 0 ? (
            <p className="text-base-content/60 py-4">
              No suggestions available
            </p>
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
