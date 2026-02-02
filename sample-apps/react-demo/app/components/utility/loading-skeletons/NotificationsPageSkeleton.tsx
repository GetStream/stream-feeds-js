import { NotificationSkeleton } from './NotificationSkeleton';

export const NotificationsPageSkeleton = () => (
  <ul className="list w-full self-stretch overflow-y-auto">
    <li className="list-row w-full">
      <div className="list-col-grow w-full min-w-0">
        <NotificationSkeleton />
      </div>
    </li>
    <li className="list-row w-full">
      <div className="list-col-grow w-full min-w-0">
        <NotificationSkeleton />
      </div>
    </li>
    <li className="list-row w-full">
      <div className="list-col-grow w-full min-w-0">
        <NotificationSkeleton />
      </div>
    </li>
  </ul>
);
