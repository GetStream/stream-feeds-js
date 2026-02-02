export const ActivitySkeleton = () => (
  <div className="w-full p-4 border-b border-base-300 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="size-10 md:size-12 rounded-full bg-base-300 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-base-300 rounded w-24" />
          <div className="h-3 bg-base-300 rounded w-16" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-base-300 rounded w-full" />
          <div className="h-4 bg-base-300 rounded w-3/4" />
        </div>
        <div className="h-40 bg-base-300 rounded-xl w-full" />
        <div className="flex gap-4 pt-2">
          <div className="h-4 bg-base-300 rounded w-12" />
          <div className="h-4 bg-base-300 rounded w-12" />
          <div className="h-4 bg-base-300 rounded w-12" />
        </div>
      </div>
    </div>
  </div>
);
