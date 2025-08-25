import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

const messaging = getMessaging();

setBackgroundMessageHandler(messaging, async (msg) => {
  await notifee.createChannel({
    id: 'default',
    name: 'Default',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: msg.data?.title as string,
    body: (msg.data?.body as string) ?? '',
    data: msg.data,
    android: { channelId: 'default', pressAction: { id: 'default' } },
  });
});

(async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
})();
