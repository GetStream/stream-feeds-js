import { StyleSheet, Text } from 'react-native';
import React from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';

export const HashtagPreview = ({
  text,
  handle,
  onPressHashtag,
}: {
  text: string;
  handle: string;
  onPressHashtag: (handle: string) => void;
}) => {
  const onPress = useStableCallback(() => onPressHashtag(handle));
  return (
    <Text style={styles.mention} onPress={onPress}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  mention: {
    color: '#64748B',
    fontWeight: '600',
  },
});
