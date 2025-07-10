import { Pressable, StyleSheet } from 'react-native';
import { useClientConnectedUser } from '@stream-io/feeds-react-native-sdk';

import { Text, View } from '@/components/Themed';
import { useUserContext } from '@/contexts/UserContext';
import { ConnectionLoadHeader } from '@/components/ConnectionLostHeader';
import React from 'react';

export default function TabOneScreen() {
  const user = useClientConnectedUser();
  const { logOut } = useUserContext();

  return (
    <View style={styles.container}>
      <ConnectionLoadHeader />
      <Text style={styles.title}>Stream Feeds Demo</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Text style={styles.info}>
        {user ? `Currently connected with ${user.id}` : 'No connected user yet'}
      </Text>
      <Pressable
        onPress={logOut}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.icon}>⎋</Text>
        <Text style={styles.label}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  info: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 18,
    color: '#fff',
    marginRight: 8,
    lineHeight: 18,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
