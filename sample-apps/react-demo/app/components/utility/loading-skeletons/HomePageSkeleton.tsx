import { ActivitySkeleton } from './ActivitySkeleton';
import { ComposerSkeleton } from './ComposerSkeleton';
import { StoryCircleSkeleton } from './StoryCircleSkeleton';

export const HomePageSkeleton = () => (
  <div className="w-full flex flex-col items-center justify-start">
    {/* Stories Section Skeleton */}
    <section className="w-full border-b border-base-content/10 py-3 px-4">
      <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide">
        <StoryCircleSkeleton />
        <StoryCircleSkeleton />
        <StoryCircleSkeleton />
        <StoryCircleSkeleton />
        <StoryCircleSkeleton />
      </div>
    </section>

    {/* Composer Section Skeleton */}
    <section className="w-full hidden md:block">
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
