import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityResponse,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useBottomSheetState } from '@/hooks/useBottomSheetState';
import {
  setEditingActivity,
  resetState,
} from '@/store/activity-action-state-store';
import { useStableCallback } from '@/hooks/useStableCallback';
import { SheetList } from '@/components/BottomSheet/SheetList';
import { Alert } from 'react-native';
import { useActivityActionState } from '@/hooks/useActivityActionState';
import { useRouter } from 'expo-router';
import { closeSheet as closeSheetInternal } from '@/store/bottom-sheet-state-store';

export const ActivitySheet = () => {
  const router = useRouter();
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();
  const { data, closeSheet } = useBottomSheetState();
  const activity = data?.entity as ActivityResponse;
  const { editingActivity } = useActivityActionState();

  const deleteAction = useStableCallback(() => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post ? The action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            const idToDelete = activity.id;
            client?.deleteActivity({ id: idToDelete });

            if (idToDelete === editingActivity?.id) {
              resetState();
            }

            closeSheetInternal();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  });
  const editAction = useStableCallback(() => {
    setEditingActivity(activity);
    closeSheet();
    router.push('/create-post-modal');
  });

  const items = useMemo(
    () => [
      ...(connectedUser?.id === activity.user.id
        ? [
            {
              title: 'Delete Post',
              action: deleteAction,
              icon: <Ionicons name="trash" color="red" size={20} />,
              preventAutoclose: true,
            },
            {
              title: 'Edit Post',
              action: editAction,
              icon: <Ionicons name="pencil" color="blue" size={20} />,
              preventAutoclose: true,
            },
          ]
        : []),
    ],
    [activity.user.id, connectedUser?.id, deleteAction, editAction],
  );

  return <SheetList items={items} />;
};
