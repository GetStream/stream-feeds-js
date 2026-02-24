import { ActivitySkeleton } from './ActivitySkeleton';

export const ProfilePageSkeleton = () => (
  <div className="w-full flex flex-col items-stretch">
    <div className="flex flex-col items-center gap-3 px-4 py-4 border-b border-base-content/10 animate-pulse">
      <div className="flex flex-row items-center gap-3">
        <div className="size-10 rounded-full bg-base-300 shrink-0" />
        <div className="h-5 bg-base-300 rounded w-32" />
      </div>
      <div className="flex flex-row items-center gap-4">
        <div className="h-4 bg-base-300 rounded w-16" />
        <div className="h-4 bg-base-300 rounded w-20" />
        <div className="h-4 bg-base-300 rounded w-20" />
        <div className="h-4 bg-base-300 rounded w-20" />
      </div>
    </div>
    <ActivitySkeleton />
    <ActivitySkeleton />
    <ActivitySkeleton />
  </div>
);
