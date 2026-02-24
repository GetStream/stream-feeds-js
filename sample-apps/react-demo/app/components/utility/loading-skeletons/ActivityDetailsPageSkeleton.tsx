import { ActivitySkeleton } from './ActivitySkeleton';

const CommentSkeleton = () => (
  <div className="w-full px-4 py-3 border-b border-base-content/10 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="size-10 rounded-full bg-base-300 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 bg-base-300 rounded w-20" />
          <div className="h-3 bg-base-300 rounded w-14" />
        </div>
        <div className="h-4 bg-base-300 rounded w-full max-w-md" />
      </div>
    </div>
  </div>
);

export const ActivityDetailsPageSkeleton = () => (
  <div className="flex flex-col h-full max-h-full">
    <ActivitySkeleton />
    <div className="px-4 py-3 border-b border-base-content/10">
      <div className="h-5 bg-base-300 rounded w-24 animate-pulse" />
    </div>
    <div className="px-4 py-3 border-b border-base-content/10 animate-pulse">
      <div className="h-10 bg-base-300 rounded w-full" />
    </div>
    <CommentSkeleton />
    <CommentSkeleton />
    <CommentSkeleton />
  </div>
);
