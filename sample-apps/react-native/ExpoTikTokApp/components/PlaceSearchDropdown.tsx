import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStableCallback } from '@/hooks/useStableCallback';
import { placesApiKey } from '@/constants/stream';

export type Place = {
  latitude: number;
  longitude: number;
  name: string;
  id: string;
};

type PlaceSearchDropdownProps = {
  onPlaceSelected: (place: Place | null) => void;
};

export const PlaceSearchDropdown = ({
  onPlaceSelected,
}: PlaceSearchDropdownProps) => {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaces = useStableCallback(async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text,
        )}&limit=3&lang=en&apiKey=${placesApiKey}`,
      );
      const json = await res.json();
      setResults(
        json.features.map(
          (place: {
            properties: {
              lat: number;
              lon: number;
              city: string;
              country: string;
              place_id: string;
            };
          }) => {
            const { lat, lon, city, country, place_id } = place.properties;

            return {
              latitude: lat,
              longitude: lon,
              name: `${city}, ${country}`,
              id: place_id,
            };
          },
        ) ?? [],
      );
    } catch (err) {
      console.warn(
        'An error has occurred while searching for a location:',
        err,
      );
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetchPlaces(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchPlaces, query]);

  const resetSearch = () => {
    setQuery('');
    setResults([]);
  };

  const resultPressedRef = useRef(false);

  const handleSelect = useStableCallback((item: Place) => {
    onPlaceSelected(item);

    setSelectedLocation(item.name);
    resetSearch();
    resultPressedRef.current = false;
  });

  const handleBlur = useStableCallback(() => {
    if (resultPressedRef.current) return;
    resetSearch();
  });

  return (
    <View style={styles.container}>
      <View style={styles.textInputContainer}>
        <TextInput
          placeholder="Search for a place..."
          editable={!selectedLocation}
          value={selectedLocation ?? query}
          onChangeText={setQuery}
          style={styles.input}
          onBlur={handleBlur}
        />
        {loading && <ActivityIndicator size="small" style={styles.spinner} />}
        {selectedLocation && (
          <Pressable
            style={styles.spinner}
            onPress={() => {
              setSelectedLocation(null);
              onPlaceSelected(null);
            }}
          >
            <Ionicons name="close" size={18} color="#888" />
          </Pressable>
        )}
      </View>
      <View style={styles.dropdownContainer}>
        {results.length > 0 && (
          <View style={styles.dropdown}>
            {results.map((result) => (
              <Pressable
                onTouchStart={() => {
                  resultPressedRef.current = true;
                }}
                key={result.id}
                style={styles.item}
                onPress={() => handleSelect(result)}
              >
                <Text>{result.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { zIndex: 10, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  dropdownContainer: {
    width: '100%',
  },
  dropdown: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    position: 'absolute',
  },
  item: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  textInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  spinner: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10, // half of spinner height to center vertically
  },
});
