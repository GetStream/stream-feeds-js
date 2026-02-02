export const FollowSuggestionSkeleton = () => (
  <div className="w-full flex flex-row items-center gap-3 py-3 animate-pulse">
    <div className="size-10 rounded-full bg-base-300 shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-4 bg-base-300 rounded w-24" />
      <div className="h-3 bg-base-300 rounded w-16" />
    </div>
    <div className="h-8 w-20 bg-base-300 rounded-full shrink-0" />
  </div>
);
