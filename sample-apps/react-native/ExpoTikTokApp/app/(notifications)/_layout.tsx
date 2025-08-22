import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { NavigationBackButton } from '@/components/Buttons';
import { useOwnFeedsContext } from '@/contexts/OwnFeedsContext';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useNotificationStatus } from '@stream-io/feeds-react-native-sdk';

const NotificationBackButton = () => {
  const { ownNotificationFeed } = useOwnFeedsContext();
  const { unseen = 0 } = useNotificationStatus(ownNotificationFeed) ?? {};

  const markSeen = useStableCallback(async () => {
    try {
      if (unseen > 0) {
        await ownNotificationFeed?.markActivity({
          mark_all_seen: true,
        });
      }
    } catch (error) {
      console.error(
        `An error has occurred while marking notifications as seen for feed ${ownNotificationFeed?.feed}: `,
        error,
      );
    }
  });

  useEffect(() => {
    markSeen();
  }, [markSeen]);

  return <NavigationBackButton preNavigationCallback={markSeen} />;
};

// Additional things will be needed here in the future, hence why this is
// a stack and not a separate screen.
const NotificationsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="notifications-screen"
        options={{
          title: 'Notifications',
          headerLeft: () => <NotificationBackButton />,
        }}
      />
    </Stack>
  );
};

export default NotificationsLayout;
