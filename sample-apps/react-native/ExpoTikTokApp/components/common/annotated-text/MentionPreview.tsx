import { StyleSheet, Text, TextInputProps } from 'react-native';
import React from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';

export const MentionPreview = ({
  text,
  handle,
  onPressMention,
}: {
  text: string;
  handle: string;
  onPressMention: (handle: string) => void;
}) => {
  const onPress = useStableCallback(() => onPressMention(handle));
  return (
    <Text style={styles.mention} onPress={onPress}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  mention: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
