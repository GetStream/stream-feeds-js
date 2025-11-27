import { Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStableCallback } from '@/hooks/useStableCallback';
import { openSheetWith } from '@/store/bottom-sheet-state-store';
import type { ActivityResponse } from '@stream-io/feeds-react-native-sdk';
import { useRouter } from 'expo-router';

export const ActivityAction = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const router = useRouter();
  const name =
    Platform.OS === 'android' ? 'ellipsis-vertical' : 'ellipsis-horizontal';

  const openSheet = useStableCallback(() => {
    openSheetWith({ type: 'activity', entity: activity });
    router.push('/overlay/sheet');
  });

  return (
    <TouchableOpacity
      onPress={openSheet}
      hitSlop={8}
      accessibilityLabel="More actions"
    >
      <Ionicons name={name} size={20} color='white' />
    </TouchableOpacity>
  );
};
