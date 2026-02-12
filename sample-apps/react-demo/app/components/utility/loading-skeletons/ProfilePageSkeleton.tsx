import { ActivitySkeleton } from './ActivitySkeleton';

export const ProfilePageSkeleton = () => (
  <div className="w-full flex flex-col items-center justify-start gap-4">
    <div className="flex flex-row items-center justify-center gap-4 animate-pulse">
      <div className="size-10 md:size-12 rounded-full bg-base-300 shrink-0" />
      <div className="h-6 bg-base-300 rounded w-32" />
    </div>
    <div className="stats animate-pulse">
      <div className="stat">
        <div className="stat-title">Posts</div>
        <div className="stat-value">
          <div className="h-8 w-8 bg-base-300 rounded" />
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Followers</div>
        <div className="stat-value">
          <div className="h-8 w-8 bg-base-300 rounded" />
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Following</div>
        <div className="stat-value">
          <div className="h-8 w-8 bg-base-300 rounded" />
        </div>
      </div>
      <div className="stat">
        <div className="stat-title">Members</div>
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
