import { NotificationSkeleton } from './NotificationSkeleton';

export const NotificationsPageSkeleton = () => (
  <ul className="w-full self-stretch overflow-y-auto">
    <li className="w-full px-4 py-3 border-b border-base-content/10">
      <NotificationSkeleton />
    </li>
    <li className="w-full px-4 py-3 border-b border-base-content/10">
      <NotificationSkeleton />
    </li>
    <li className="w-full px-4 py-3 border-b border-base-content/10 last:border-b-0">
      <NotificationSkeleton />
    </li>
  </ul>
);
