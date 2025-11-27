import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export const extractNotificationConfig = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const { stream, ...rest } = remoteMessage.data ?? {};
  const data = {
    ...rest,
    ...((stream as unknown as Record<string, string> | undefined) ?? {}), // extract and merge stream object if present
  };
  const notification = remoteMessage.notification ?? {};
  const body = (data.body ?? notification.body ?? '') as string;
  const title = (data.title ?? notification.title) as string;

  return { data, body, title };
};
