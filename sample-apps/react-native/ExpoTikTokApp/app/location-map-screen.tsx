import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { View } from '@/components/Themed';

const LocationMapScreen = () => {
  const { latitude: latitudeParam, longitude: longitudeParam } =
    useLocalSearchParams();
  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);

  const initialRegion = useMemo(
    () => ({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [latitude, longitude],
  );

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default LocationMapScreen;
