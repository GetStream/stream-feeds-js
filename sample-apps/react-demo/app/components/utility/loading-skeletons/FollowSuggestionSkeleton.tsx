export const FollowSuggestionSkeleton = () => (
  <div className="w-full flex flex-row items-center gap-2.5 px-4 py-2.5 animate-pulse">
    <div className="size-8 rounded-full bg-base-300 shrink-0" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="h-3.5 bg-base-300 rounded w-24" />
      <div className="h-3 bg-base-300 rounded w-16" />
    </div>
    <div className="h-7 w-16 bg-base-300 rounded-full shrink-0" />
  </div>
);
