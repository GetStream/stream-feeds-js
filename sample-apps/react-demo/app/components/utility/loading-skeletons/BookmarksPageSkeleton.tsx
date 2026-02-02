import { ActivitySkeleton } from './ActivitySkeleton';

export const BookmarksPageSkeleton = () => (
  <div className="w-full flex flex-col items-stretch gap-4">
    <div className="text-lg font-semibold w-full px-4 lg:px-0">Bookmarks</div>
    <ul className="w-full list">
      <li className="list-row w-full">
        <div className="list-col-grow w-full min-w-0">
          <ActivitySkeleton />
        </div>
      </li>
      <li className="list-row w-full">
        <div className="list-col-grow w-full min-w-0">
          <ActivitySkeleton />
        </div>
      </li>
      <li className="list-row w-full">
        <div className="list-col-grow w-full min-w-0">
          <ActivitySkeleton />
        </div>
      </li>
    </ul>
  </div>
);
