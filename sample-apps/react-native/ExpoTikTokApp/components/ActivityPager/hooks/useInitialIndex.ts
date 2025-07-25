import { useLocalSearchParams } from 'expo-router';
import {
  useFeedActivities
} from '@stream-io/feeds-react-native-sdk';
import { useRef } from 'react';

export const useInitialIndex = () => {
  const { initialIndex, activityId: activityIdParam } = useLocalSearchParams();
  const { activities } = useFeedActivities() ?? {};

  const activityId = activityIdParam as string;

  const resolvedInitialIndexRef = useRef<number | undefined>(undefined);

  if (resolvedInitialIndexRef.current === undefined && activities) {
    if (initialIndex != null) {
      resolvedInitialIndexRef.current = Number(initialIndex);
    } else if (activities && activities.length > 0) {
      const fallbackIndex = activities.findIndex((activity) => {
        return activity.id === activityId;
      });

      resolvedInitialIndexRef.current = fallbackIndex !== -1 ? fallbackIndex : 0;
    }
  }

  return resolvedInitialIndexRef.current;
}
