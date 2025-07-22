import React, { useState } from 'react';
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

export const CommentsInput = ({ activityId }: { activityId: string }) => {
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();
  const [text, setText] = useState('');

  const handleSend = useStableCallback(() => {
    if (!text.trim()) return;
    console.log('TRYING THIS');
    client?.addComment({
      comment: text as string,
      object_id: activityId,
      object_type: 'activity',
      // FIXME: Handle deeply nested comments too
      // parent_id: activityId,
    }).catch(e => console.error(e));
    setText('');
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 128 : 0}
    >
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
});
