import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import {
  useClientConnectedUser,
  useWsConnectionState,
} from '@stream-io/feeds-react-native-sdk';

const HEADER_HEIGHT = 30;

export const ConnectionLoadHeader = () => {
  const { isHealthy } = useWsConnectionState();
  const connectedUser = useClientConnectedUser();

  const visible = useDerivedValue(() => {
    return !isHealthy && connectedUser ? 1 : 0;
  }, [isHealthy, connectedUser]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(visible.value === 1 ? 0 : -HEADER_HEIGHT, {
          duration: 250,
        }),
      },
    ],
    opacity: withTiming(visible.value, { duration: 250 }),
  }));

  if (isHealthy) {
    return null;
  }

  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <Text style={styles.headerText}>Reconnecting...</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    height: HEADER_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: '#6200ee',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
