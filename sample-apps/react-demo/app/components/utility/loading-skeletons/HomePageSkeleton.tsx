import { ActivitySkeleton } from './ActivitySkeleton';
import { ComposerSkeleton } from './ComposerSkeleton';
import { StoryCircleSkeleton } from './StoryCircleSkeleton';

export const HomePageSkeleton = () => (
  <div className="w-full flex flex-col items-center justify-start">
    {/* Stories Section Skeleton */}
    <section className="w-full border-b border-base-300 py-3 relative">
      <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide px-2">
        <StoryCircleSkeleton />
        <StoryCircleSkeleton />
        <StoryCircleSkeleton />
        <StoryCircleSkeleton />
        <StoryCircleSkeleton />
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-base-100 to-transparent pointer-events-none" />
    </section>

    {/* Composer Section Skeleton */}
    <section className="w-full hidden md:block pt-3">
      <ComposerSkeleton />
    </section>

    {/* Feed Section Skeleton */}
    <section className="w-full">
      <ActivitySkeleton />
      <ActivitySkeleton />
      <ActivitySkeleton />
    </section>
  </div>
);
