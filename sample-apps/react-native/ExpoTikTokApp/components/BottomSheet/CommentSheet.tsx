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
import {
  setParent,
  setEditingEntity,
  resetState,
} from '@/store/comment-input-state-store';
import { useCommentInputState } from '@/hooks/useCommentInputState';
import { useStableCallback } from '@/hooks/useStableCallback';

export const CommentSheet = () => {
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();
  const { data } = useBottomSheetState();
  const comment = data?.entity as CommentResponse;
  const depth = data?.depth;
  const { parent, editingEntity } = useCommentInputState();

  const deleteAction = useStableCallback(() => () => {
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
            const idToDelete = comment.id;
            client?.deleteComment({ id: idToDelete });

            if (idToDelete === parent?.id || idToDelete === editingEntity?.id) {
              resetState();
            }

            closeSheet();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  });
  const editAction = useStableCallback(() => setEditingEntity(comment));
  const replyAction = useStableCallback(() => setParent(comment));

  const items = useMemo(
    () => [
      ...(connectedUser?.id === comment.user.id
        ? [
            {
              title: 'Delete Comment',
              action: deleteAction,
              icon: <Ionicons name="trash" color="red" size={20} />,
              preventAutoclose: true,
            },
            {
              title: 'Edit Comment',
              action: editAction,
              icon: <Ionicons name="pencil" color="blue" size={20} />,
            },
          ]
        : []),
      ...(depth === 0
        ? [
            {
              title: 'Reply',
              action: replyAction,
              icon: <Ionicons name="arrow-undo" size={20} color="#666" />,
            },
          ]
        : []),
    ],
    [
      comment.user.id,
      connectedUser?.id,
      deleteAction,
      depth,
      editAction,
      replyAction,
    ],
  );

  return <SheetList items={items} />;
};
