import { ActivitySkeleton } from './ActivitySkeleton';
import { ComposerSkeleton } from './ComposerSkeleton';

const CommentSkeleton = () => (
  <div className="w-full flex items-start gap-3 py-3 animate-pulse">
    <div className="size-8 rounded-full bg-base-300 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-3 bg-base-300 rounded w-20" />
        <div className="h-3 bg-base-300 rounded w-14" />
      </div>
      <div className="h-4 bg-base-300 rounded w-full max-w-md" />
    </div>
  </div>
);

export const ActivityDetailsPageSkeleton = () => (
  <div className="flex flex-col h-full max-h-full gap-4">
    <div className="flex-shrink-0 flex flex-col gap-4 [&>*:first-child]:border-b-0">
      <ActivitySkeleton />
      <div className="h-5 bg-base-300 rounded w-24 animate-pulse" />
      <ComposerSkeleton />
      <div className="space-y-1">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    </div>
  </div>
);
