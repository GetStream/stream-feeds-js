import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { extractNotificationConfig } from '@/utils/push-notifications/extractNotificationConfig';

const messaging = getMessaging(getApp());

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  await notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });

  const { data, body, title } = extractNotificationConfig(remoteMessage);

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'default',
      smallIcon: 'notification_icon',
      color: '#2063F6',
      pressAction: { id: 'default', launchActivity: 'default' },
    },
  });
});

(async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
})();
