import { ActivitySkeleton } from './ActivitySkeleton';
import { FollowSuggestionSkeleton } from './FollowSuggestionSkeleton';

type SearchResultsTab = 'activities' | 'feeds';

export const SearchResultsSkeleton = ({
  tab = 'activities',
}: {
  tab?: SearchResultsTab;
}) => (
  <div className="w-full flex flex-col items-center justify-start gap-4 pt-4">
    {tab === 'activities' ? (
      <>
        <ActivitySkeleton />
        <ActivitySkeleton />
        <ActivitySkeleton />
      </>
    ) : (
      <>
        <FollowSuggestionSkeleton />
        <FollowSuggestionSkeleton />
        <FollowSuggestionSkeleton />
      </>
    )}
  </div>
);
