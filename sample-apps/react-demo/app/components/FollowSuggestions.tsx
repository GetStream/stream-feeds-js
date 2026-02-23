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
    <div className="rounded-2xl overflow-hidden border border-base-content/10">
      <div className="px-4 py-3">
        <h2 className="text-[15px] font-semibold">
          Who to follow
        </h2>
      </div>
      <div className="w-full flex flex-col">
        {isLoading ? (
          <>
            <FollowSuggestionSkeleton />
            <FollowSuggestionSkeleton />
            <FollowSuggestionSkeleton />
          </>
        ) : suggestedFeeds.length === 0 ? (
          <p className="text-base-content/70 text-sm px-4 py-4">
            No suggestions available
          </p>
        ) : (
          suggestedFeeds.map((feed) => (
            <FeedSearchResult feed={feed} key={feed.feed} />
          ))
        )}
      </div>
    </div>
  );
};
