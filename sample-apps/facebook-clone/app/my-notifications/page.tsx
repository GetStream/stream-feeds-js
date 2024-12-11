'use client';
import { NotificationFeed } from '../components/NotificationFeed';

export default function MyNotifications() {
  return (
    <>
      <div className="w-3/4 m-auto flex flex-col items-center gap-3 overflow-auto">
        <h2 className="text-4xl font-extrabold text-center">
          All notifications
        </h2>
        <NotificationFeed></NotificationFeed>
      </div>
    </>
  );
}
