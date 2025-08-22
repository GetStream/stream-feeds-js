import { StreamFeed } from '@stream-io/feeds-react-native-sdk';
import { useOwnFeedsContext } from '@/contexts/OwnFeedsContext';
import { Notifications } from '@/components/Notifications/Notifications';
import { LoadingIndicator } from '@/components/Indicators';

const NotificationsScreen = () => {
  const { ownNotificationFeed } = useOwnFeedsContext();

  if (!ownNotificationFeed) {
    return <LoadingIndicator />;
  }
  return (
    <StreamFeed feed={ownNotificationFeed}>
      <Notifications />
    </StreamFeed>
  );
};

export default NotificationsScreen;
