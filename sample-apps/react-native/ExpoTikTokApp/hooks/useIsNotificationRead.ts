import {
  useFeedContext,
  useNotificationStatus,
} from '@stream-io/feeds-react-native-sdk';
import { useMemo } from 'react';

export const useIsNotificationRead = ({ id }: { id: string }) => {
  const feed = useFeedContext();
  const { read_activities: readActivities } = useNotificationStatus(feed) ?? {};

  return useMemo(
    () => (readActivities ?? []).includes(id),
    [readActivities, id],
  );
};
