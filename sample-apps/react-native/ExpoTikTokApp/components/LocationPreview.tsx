import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '@/components/PlaceSearchDropdown';
import { useRouter } from 'expo-router';
import { mapApiKey } from '@/constants/stream';

type LocationPreviewProps = {
  location: Omit<Place, 'id' | 'address'>;
};

export const LocationPreview = ({ location }: LocationPreviewProps) => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        if (mapApiKey) {
          router.push({ pathname: '/location-map-screen', params: location });
        }
      }}
      style={styles.container}
    >
      <Ionicons
        name="location-sharp"
        size={18}
        color="white"
        style={styles.icon}
      />
      <Text numberOfLines={1} style={styles.text}>
        {location.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    marginTop: 2,
    backgroundColor: 'transparent',
    borderRadius: 6,
    maxWidth: '100%',
  },
  icon: {
    marginRight: 2,
  },
  text: {
    fontSize: 14,
    color: 'white',
    flexShrink: 1,
  },
});
