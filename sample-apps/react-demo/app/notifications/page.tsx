'use client';

import { StreamFeed } from '@stream-io/feeds-react-sdk';
import { useOwnFeedsContext } from '../own-feeds-context';
import { NotificationList } from '../components/notifications/NotificationList';
import { ErrorCard } from '../components/utility/ErrorCard';

export default function Notifications() {
  const { ownNotifications, errors } = useOwnFeedsContext();

  if (!ownNotifications) {
    return null;
  }

  if (errors.ownNotifications) {
    return <ErrorCard message="Failed to load notifications" error={errors.ownNotifications} />;
  }

  return (
    <StreamFeed feed={ownNotifications}>
      <NotificationList />
    </StreamFeed>
  );
}
