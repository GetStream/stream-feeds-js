import type { User } from '@stream-io/feeds-client';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';

export const SuggestionsList = ({
  onPress,
  suggestions,
}: {
  onPress: (user: User) => void;
  suggestions: User[];
}) => {
  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      {suggestions?.map((item: User) => (
        <View key={item.id}>
          <Pressable onPress={() => onPress(item)} style={styles.row}>
            <Image
              source={{ uri: (item as User & { image: string }).image }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.username}>@{item.id}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {(item as User & { name: string }).name}
              </Text>
            </View>
          </Pressable>
          <View style={styles.sep} />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 10 },
  username: { color: '#111827', fontWeight: '600', fontSize: 14 },
  name: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#d1d5db' },
});
