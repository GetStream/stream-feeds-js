import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

import users from '../users.json';
import { useUserContext } from '@/contexts/UserContext';

type LocalUser = {
  id: string;
  name: string;
  image: string;
};

const PredefinedUserItem = ({ item }: { item: LocalUser}) => {
  const { logIn } = useUserContext();

  const handleUserSelect = useCallback((user: LocalUser) => {
    logIn({ id: user.id });
  }, [logIn]);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => handleUserSelect(item)}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  )
}

const renderItem = ({ item }: { item: LocalUser }) => <PredefinedUserItem item={item} />

const keyExtractor = (item: LocalUser) => item.id;

const Separator = () => <View style={styles.separator} />

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a user to log in</Text>
      <FlatList
        data={users}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        renderItem={renderItem}
      />
    </View>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 56,
  },
});
