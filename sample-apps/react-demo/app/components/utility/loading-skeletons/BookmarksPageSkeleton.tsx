import { ActivitySkeleton } from './ActivitySkeleton';

export const BookmarksPageSkeleton = () => (
  <div className="w-full flex flex-col items-stretch">
    <ActivitySkeleton />
    <ActivitySkeleton />
    <ActivitySkeleton />
  </div>
);
