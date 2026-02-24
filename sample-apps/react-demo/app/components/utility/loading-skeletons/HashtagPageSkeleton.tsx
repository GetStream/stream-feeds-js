import { ActivitySkeleton } from './ActivitySkeleton';

export const HashtagPageSkeleton = () => (
  <div className="w-full flex flex-col">
    <div className="w-full hidden lg:flex items-center justify-between px-4 py-3 border-b border-base-content/10 animate-pulse">
      <div className="h-5 bg-base-300 rounded w-32" />
      <div className="h-4 bg-base-300 rounded w-16" />
    </div>
    <ActivitySkeleton />
    <ActivitySkeleton />
    <ActivitySkeleton />
  </div>
);
