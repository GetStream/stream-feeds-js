import React, { useEffect, useState } from 'react';
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
import { setParent } from '@/store/comment-input-state-store';

const INPUT_METADATA_HEIGHT = 25;

export const CommentsInput = ({ activityId }: { activityId: string }) => {
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();
  const [text, setText] = useState('');
  const { parent } = useCommentInputState();

  const panelY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: panelY.value,
  }));

  const resetContextValues = useStableCallback(() => {
    setParent(undefined);
  });

  const handleSend = useStableCallback(() => {
    if (!text.trim()) return;
    client
      ?.addComment({
        comment: text as string,
        object_id: activityId,
        object_type: 'activity',
        parent_id: parent?.id,
      })
      .catch((e) => console.error(e));

    // cleanup
    setText('');
    resetContextValues();
  });

  useEffect(() => {
    if (parent) {
      panelY.value = withTiming(INPUT_METADATA_HEIGHT, { duration: 100 });
    } else {
      panelY.value = 0;
    }
  }, [panelY, parent]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 128 : 0}
    >
      <Animated.View style={[styles.inputMetadataContainer, animatedStyle]}>
        <Text style={styles.label}>{`Replying to @${parent?.user.id}`}</Text>
        <TouchableOpacity onPress={resetContextValues} hitSlop={10}>
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
          <TextInput
            value={text}
            onChangeText={setText}
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
