import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useStableCallback } from '@/hooks/useStableCallback';
import {
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCommentInputState } from '@/hooks/useCommentInputState';
import { resetState } from '@/store/comment-input-state-store';
import AutocompleteInput from '@/components/mentions/AutocompleteInput';
import { findMatchedTokens } from '@/utils/findMatchedTokens';

const INPUT_METADATA_HEIGHT = 25;

export const CommentsInput = ({ activityId }: { activityId: string }) => {
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();
  const [text, setText] = useState('');
  const { parent, editingEntity } = useCommentInputState();
  const editingEntityRef = useRef<typeof editingEntity | undefined>(undefined);

  const panelY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: panelY.value,
  }));

  const resetInputMode = useStableCallback(() => {
    resetState();
  });

  const handleSend = useStableCallback(() => {
    if (!text.trim()) return;
    const action = async () => {
      if (editingEntity) {
        return client?.updateComment({
          comment: text as string,
          id: editingEntity.id,
        });
      }

      const mentionedUsers = findMatchedTokens({ text, matcher: '@' });

      return client?.addComment({
        comment: text as string,
        object_id: activityId,
        object_type: 'activity',
        parent_id: parent?.id,
        create_notification_activity: true,
        ...(mentionedUsers ? { mentioned_user_ids: mentionedUsers } : {})
      });
    };

    action?.().catch((e) => console.error(e));

    // cleanup
    setText('');
    resetInputMode();
  });

  useEffect(() => {
    if (editingEntity && editingEntity.text) {
      setText(editingEntity.text);
    }

    if (!editingEntity && editingEntityRef.current) {
      setText('');
    }

    editingEntityRef.current = editingEntity;

    if (parent || editingEntity) {
      panelY.value = withTiming(INPUT_METADATA_HEIGHT, { duration: 100 });
    } else {
      panelY.value = 0;
    }
  }, [editingEntity, panelY, parent]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 128 : 0}
    >
      <Animated.View style={[styles.inputMetadataContainer, animatedStyle]}>
        <Text style={styles.label}>
          {editingEntity
            ? `Editing @${editingEntity?.user.id}'s comment`
            : `Replying to @${parent?.user.id}`}
        </Text>
        <TouchableOpacity onPress={resetInputMode} hitSlop={10}>
          <Ionicons name="close" size={18} color="#aaa" />
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.wrapper}>
        <Image
          source={{
            // @ts-expect-error OpenAPI spec is wrong.
            uri: connectedUser?.image,
          }}
          style={styles.avatar}
        />
        <View style={styles.inputContainer}>
          <AutocompleteInput
            text={text}
            setText={setText}
            placeholder="Add comment..."
            placeholderTextColor="#888"
            style={styles.input}
            multiline={true}
          />
          {text.trim().length > 0 && (
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccc',
    marginRight: 8,
    alignSelf: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 48,
    fontSize: 15,
    color: '#000',
    paddingRight: 8,
  },
  sendButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  sendText: {
    color: '#0af',
    fontSize: 15,
    fontWeight: '600',
  },
  inputMetadataContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: '100%',
    backgroundColor: '#222',
    borderRadius: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
  },
});
