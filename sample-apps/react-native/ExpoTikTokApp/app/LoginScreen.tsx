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

export default function LoginScreen() {
  const { logIn } = useUserContext();

  const handleUserSelect = useCallback((user: LocalUser) => {
    logIn({ id: user.id });
  }, [logIn]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a user to log in</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => handleUserSelect(item)}
          >
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

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
