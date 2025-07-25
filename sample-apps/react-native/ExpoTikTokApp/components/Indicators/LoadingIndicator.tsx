import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React from 'react';

export const LoadingIndicator = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
