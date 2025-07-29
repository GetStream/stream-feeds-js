import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStableCallback } from '@/hooks/useStableCallback';
import { placesApiKey } from '@/constants/stream';
import { usePostCreationContext } from '@/contexts/PostCreationContext';
import { useRouter } from 'expo-router';

export type Place = {
  latitude: number;
  longitude: number;
  address: string;
  name: string;
  id: string;
};

export const PlaceSearchDropdown = () => {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const { setLocation } = usePostCreationContext();
  const router = useRouter();

  const fetchPlaces = useStableCallback(async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text,
        )}&limit=10&lang=en&apiKey=${placesApiKey}`,
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
              address_line1: string;
              address_line2: string
            };
          }) => {
            const { lat, lon, city, country, place_id, address_line1, address_line2 } = place.properties;

            return {
              address: `${address_line1}, ${address_line2}`,
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
    setLocation?.(item);

    setSelectedLocation(item.name);
    resetSearch();
    resultPressedRef.current = false;

    router.back();
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#888"
            style={styles.input}
            value={selectedLocation ?? query}
            onChangeText={setQuery}
          />
          {loading && <ActivityIndicator size="small" style={styles.spinner} />}
          {selectedLocation && (
            <Pressable
              style={styles.spinner}
              onPress={() => {
                setSelectedLocation(null);
                setLocation?.(undefined);
              }}
            >
              <Ionicons name="close" size={18} color="#888" />
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.dropdownContainer}>
        <FlatList
          data={results}
          contentContainerStyle={styles.listContainer}
          style={{ flex: 1 }}
          renderItem={({ item }: { item: Place }) => (
            <Pressable
              onTouchStart={() => {
                resultPressedRef.current = true;
              }}
              style={styles.item}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.name}>{item.name}</Text>
            </Pressable>
          )}
          keyExtractor={(item: Place) => item.id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={40} color="#ccc" />
              <Text style={styles.title}>No locations found</Text>
              <Text style={styles.subtitle}>
                Try searching for a place, hotel or attraction
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 8 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: '#000',
  },
  dropdownContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  item: {
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  spinner: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10,
  },
  title: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    alignSelf: 'center',
  },
});
