'use client';

import { StreamFeed } from '@stream-io/feeds-react-sdk';
import { useOwnFeedsContext } from '../own-feeds-context';
import { NotificationList } from '../components/notifications/NotificationList';

export default function Notifications() {
  const { ownNotifications } = useOwnFeedsContext();

  if (!ownNotifications) {
    return null;
  }

  return (
    <StreamFeed feed={ownNotifications}>
      <NotificationList />
    </StreamFeed>
  );
}
