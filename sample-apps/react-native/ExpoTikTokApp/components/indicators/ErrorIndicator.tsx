import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

export const ErrorIndicator = ({ context }: { context: string }) => (
  <View style={styles.container}>
    <Text style={styles.errorText}>
      Something went wrong while loading {context}.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
});
