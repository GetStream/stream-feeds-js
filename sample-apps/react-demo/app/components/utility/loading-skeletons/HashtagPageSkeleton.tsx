import { ActivitySkeleton } from './ActivitySkeleton';

export const HashtagPageSkeleton = () => (
  <div className="w-full flex flex-col items-center justify-start gap-4">
    <div className="flex flex-row items-center justify-center gap-4 animate-pulse">
      <div className="h-7 bg-base-300 rounded w-40" />
    </div>
    <div className="stats animate-pulse">
      <div className="stat">
        <div className="stat-title">Posts</div>
        <div className="stat-value">
          <div className="h-8 w-8 bg-base-300 rounded" />
        </div>
      </div>
    </div>
    <div className="w-full">
      <ActivitySkeleton />
      <ActivitySkeleton />
      <ActivitySkeleton />
    </div>
  </div>
);
