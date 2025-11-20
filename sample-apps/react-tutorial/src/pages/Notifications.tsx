import { StreamFeed } from '@stream-io/feeds-react-sdk';
import { useOwnFeedContext } from '../own-feeds-context';
import { NotificationList } from '../components/notifications/NotificationList';

export const Notifications = () => {
  const { ownNotifications } = useOwnFeedContext();

  if (!ownNotifications) {
    return null;
  }

  return (
    <StreamFeed feed={ownNotifications}>
      <NotificationList />
    </StreamFeed>
  );
};
