import { useBottomSheetState } from '@/hooks/useBottomSheetState';
import { Alert } from 'react-native';
import {
  CommentResponse,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SheetList } from '@/components/BottomSheet/SheetList';
import { closeSheet } from '@/store/bottom-sheet-state-store';
import { setParent, setEditingEntity } from '@/store/comment-input-state-store';

export const CommentSheet = () => {
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();
  const { data } = useBottomSheetState();
  const comment = data?.entity as CommentResponse;
  const depth = data?.depth;

  const items = useMemo(
    () => [
      ...(connectedUser?.id === comment.user.id
        ? [
            {
              title: 'Delete Comment',
              action: () => {
                Alert.alert(
                  'Delete Comment',
                  'Are you sure you want to delete this comment ? The action cannot be undone.',
                  [
                    {
                      text: 'No',
                      style: 'cancel',
                    },
                    {
                      text: 'Yes',
                      onPress: () => {
                        client?.deleteComment({ id: comment.id });
                        closeSheet();
                      },
                      style: 'destructive',
                    },
                  ],
                  { cancelable: true },
                );
              },
              icon: <Ionicons name="trash" color="red" size={20} />,
              preventAutoclose: true,
            },
            {
              title: 'Edit Comment',
              action: () => setEditingEntity(comment),
              icon: <Ionicons name="pencil" color="blue" size={20} />,
            },
          ]
        : []),
      ...(depth === 0
        ? [
            {
              title: 'Reply',
              action: () => setParent(comment),
              icon: <Ionicons name="arrow-undo" size={20} color="#666" />,
            },
          ]
        : []),
    ],
    [client, comment, connectedUser?.id, depth],
  );

  return <SheetList items={items} />;
};
