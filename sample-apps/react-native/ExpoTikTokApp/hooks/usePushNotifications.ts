import {
  getMessaging,
  getInitialNotification as fbGetInitialNotification,
  requestPermission,
  onTokenRefresh,
  onMessage,
  onNotificationOpenedApp,
  hasPermission,
  getToken,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  CreateDeviceRequest,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useEffect, useRef } from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';
import { router } from 'expo-router';

const messaging = getMessaging();

// FIXME: Fix this type.
const navigateFromData = (data?: Record<string, any>) => {
  if (!data) {
    return;
  }
  if (
    ['feeds.comment.added', 'feeds.comment.reaction.added'].includes(data.type)
  ) {
    const [groupId, id] = data.fid.split(':');
    router.push({
      pathname: '/comments-modal',
      params: {
        feedUserId: id,
        feedGroupId: groupId,
        activityId: data.activity_id,
      },
    });
    return;
  }

  if (data.type === 'feeds.activity.reaction.added') {
    const [groupId, id] = data.fid.split(':');
    router.push({
      pathname: '/activity-pager-screen',
      params: {
        activityId: data.activity_id,
        groupId,
        id,
      },
    });
    return;
  }
};

const getInitialNotification = async () => {
  if (Platform.OS === 'ios') {
    const initialNotification = await fbGetInitialNotification(messaging);
    if (initialNotification) {
      const data = initialNotification.data;
      if (data) {
        navigateFromData(data);
      }
    }
  } else {
    const initialNotification = await notifee.getInitialNotification();
    console.log('INITIAL: ', initialNotification)
    if (initialNotification) {
      const data = initialNotification.notification.data;
      if (data) {
        navigateFromData(data);
      }
    }
  }
};

const requestNotificationPermission = async () => {
  const authStatus = await requestPermission(messaging);
  const isEnabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;
  console.log('Permission Status', { authStatus, isEnabled });
};

const requestAndroidPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

export const usePushNotifications = () => {
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  const unsubscribePushListenersRef = useRef<() => void>(undefined);

  const registerNotificationListeners = useStableCallback(async () => {
    if (!client || !connectedUser) {
      return;
    }

    try {
      const permissionAuthStatus = await hasPermission(messaging);
      let isEnabled =
        permissionAuthStatus === AuthorizationStatus.AUTHORIZED ||
        permissionAuthStatus === AuthorizationStatus.PROVISIONAL;

      if (permissionAuthStatus === AuthorizationStatus.DENIED) {
        isEnabled = await requestAndroidPermission();
      }

      if (isEnabled) {
        // Register FCM token with stream chat server.
        // const apnsToken = await messaging.getAPNSToken();
        const firebaseToken = await getToken(messaging);

        const createDeviceConfiguration: CreateDeviceRequest = {
          id: firebaseToken,
          push_provider: 'firebase',
          push_provider_name: 'rn-fcm',
        };

        await client.createDevice(createDeviceConfiguration);

        const devices = await client.listDevices();

        console.log('devices created', devices);

        // for (const device of devices.devices) {
        //   await client.deleteDevice({ id: device.id });
        // }

        // Listen to new FCM tokens and register them with stream chat server.
        const unsubscribeTokenRefresh = onTokenRefresh(
          messaging,
          async (newFirebaseToken) => {
            await client.createDevice({
              ...createDeviceConfiguration,
              id: newFirebaseToken,
            });
          },
        );
        // show notifications when on foreground
        const unsubscribeForegroundMessageReceive = onMessage(
          messaging,
          async (remoteMessage) => {
            const { stream, ...rest } = remoteMessage.data ?? {};
            const data = {
              ...rest,
              ...((stream as unknown as Record<string, string> | undefined) ??
                {}), // extract and merge stream object if present
            };
            const channelId = await notifee.createChannel({
              id: 'foreground',
              name: 'Foreground Messages',
            });
            // create the android channel to send the notification to
            // display the notification on foreground
            const notification = remoteMessage.notification ?? {};
            const body = (data.body ?? notification.body) as string;
            const title = (data.title ?? notification.title) as string;

            if (body && title) {
              await notifee.displayNotification({
                android: {
                  channelId,
                  pressAction: {
                    id: 'default',
                  },
                },
                body,
                title,
                data,
              });
            }
          },
        );

        // 1) Tapped system FCM banner while app in background
        const unsubOpen = onNotificationOpenedApp(messaging, (message) => {
          navigateFromData(message?.data);
        });

        // 2) App launched from a tapped system FCM banner (cold start)
        getInitialNotification();

        // 3) Tapped a Notifee notification while app is foreground/background but running
        const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
            navigateFromData(detail.notification?.data);
          }
        });

        unsubscribePushListenersRef.current = () => {
          unsubscribeTokenRefresh();
          unsubscribeForegroundMessageReceive();
          unsubOpen();
          unsubNotifee();
        };
      }
    } catch (error) {
      console.error(
        'An error has occurred while registering push notification listeners: ',
        error,
      );
    }
  });

  useEffect(() => {
    const run = async () => {
      await requestNotificationPermission();
      await registerNotificationListeners();
    };
    if (client && connectedUser) {
      run();
    }
    return unsubscribePushListenersRef.current;
  }, [client, connectedUser, registerNotificationListeners]);
};
