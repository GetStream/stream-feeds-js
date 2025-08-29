import { Feed, User } from '@stream-io/feeds-react-native-sdk';
import { useSearchResultsContext } from '@stream-io/feeds-react-native-sdk';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';

export type Suggestion = User | Feed;
export type SuggestionListProps = {
  onPress: (user: Suggestion) => void;
  suggestions: Suggestion[];
};

export const SuggestionsList = ({
  onPress,
  suggestions,
}: SuggestionListProps) => {
  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      {suggestions?.map((item: Suggestion) => (
        <Suggestion key={item.id} item={item} onPress={onPress} />
      ))}
    </ScrollView>
  );
};

const Suggestion = ({
  item,
  onPress,
}: {
  item: Suggestion;
  onPress: SuggestionListProps['onPress'];
}) => {
  const source = useSearchResultsContext();

  if (!source) {
    return;
  }

  return source.type === 'user' ? (
    <UserSuggestion item={item as User} onPress={onPress} />
  ) : (
    <HashtagSuggestion item={item as Feed} onPress={onPress} />
  );
};

const UserSuggestion = ({
  item,
  onPress,
}: {
  item: User;
  onPress: SuggestionListProps['onPress'];
}) => {
  return (
    <>
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
    </>
  );
};

const HashtagSuggestion = ({
  item,
  onPress,
}: {
  item: Feed;
  onPress: SuggestionListProps['onPress'];
}) => {
  return (
    <>
      <Pressable onPress={() => onPress(item)} style={styles.row}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconHash}>#</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item.id}</Text>
        </View>
      </Pressable>
      <View style={styles.sep} />
    </>
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
  sep: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  iconHash: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});
