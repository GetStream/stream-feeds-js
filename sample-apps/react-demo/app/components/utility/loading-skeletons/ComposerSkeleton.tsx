export const ComposerSkeleton = () => (
  <div className="w-full p-4 rounded-xl animate-pulse">
    <div className="w-full flex items-start gap-3">
      <div className="size-10 md:size-12 rounded-full bg-base-300 shrink-0" />
      <div className="flex-1 space-y-3 pt-2">
        <div className="h-4 bg-base-300 rounded w-48" />
        <div className="h-4 bg-base-300 rounded w-32" />
      </div>
    </div>
  </div>
);
