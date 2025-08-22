import { Stack } from 'expo-router';
import React from 'react';
import { NotificationBackButton } from '@/components/Notifications/NotificationBackButton';

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
