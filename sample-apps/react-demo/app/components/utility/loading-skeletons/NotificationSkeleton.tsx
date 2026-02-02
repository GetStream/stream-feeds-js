export const NotificationSkeleton = () => (
  <div className="flex flex-row items-center justify-between gap-2 w-full max-w-full p-4 border-b border-base-300 animate-pulse">
    <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
      <div className="size-5 rounded bg-base-300 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-base-300 rounded w-3/4" />
        <div className="h-3 bg-base-300 rounded w-1/2" />
      </div>
    </div>
    <div className="flex flex-row gap-1">
      <div className="size-5 rounded-full bg-base-300" />
      <div className="size-5 rounded-full bg-base-300" />
    </div>
  </div>
);
