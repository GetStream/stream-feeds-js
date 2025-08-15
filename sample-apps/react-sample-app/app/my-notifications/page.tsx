'use client';
import { NotificationFeed } from '../components/notifications/NotificationFeed';

export default function MyNotifications() {
  return (
    <>
      <h2 className="text-4xl font-extrabold text-center">All notifications</h2>
      <NotificationFeed isMenuOpen={false}></NotificationFeed>
    </>
  );
}
