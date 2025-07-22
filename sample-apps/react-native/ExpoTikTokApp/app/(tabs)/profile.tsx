import React, { useMemo } from 'react';
import { View, Text } from '@/components/Themed';
import { ConnectionLostHeader } from '@/components/ConnectionLostHeader';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { useOwnFeedsContext } from '@/contexts/OwnFeedsContext';
import { useUserContext } from '@/contexts/UserContext';
import { Profile } from '@/components/Profile';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const { ownUserFeed, ownTimelineFeed } = useOwnFeedsContext();
  const { logOut } = useUserContext();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const extraContainerStyles = useMemo(
    () => ({
      paddingBottom:
        insets.bottom + tabBarHeight + (Platform.OS === 'ios' ? 0 : 80),
    }),
    [insets.bottom, tabBarHeight],
  );

  if (!ownUserFeed || !ownTimelineFeed) {
    return null;
  }

  return (
    <View style={[styles.container, extraContainerStyles]}>
      <ConnectionLostHeader />
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
      <View style={styles.profileContainer}>
        <Profile userFeed={ownUserFeed} timelineFeed={ownTimelineFeed} />
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, backgroundColor: '#fff' },
  profileContainer: { flex: 1, paddingBottom: 16 },
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
    alignSelf: 'center',
    marginBottom: 16,
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
