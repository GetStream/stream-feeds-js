import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function NotificationBadge({ count }: { count: number }) {
  if (!count || count <= 0) return null;
  const display = count > 9 ? '9+' : String(count);
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 0,
    right: 3,
    height: 18,
    width: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
