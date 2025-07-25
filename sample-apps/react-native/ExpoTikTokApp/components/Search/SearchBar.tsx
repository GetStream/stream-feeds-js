import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useSearchContext,
  useSearchQuery,
} from '@stream-io/feeds-react-native-sdk';

export const SearchBar = () => {
  const searchController = useSearchContext();
  const { searchQuery = '' } = useSearchQuery() ?? {};

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={18}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={searchController?.search}
            style={styles.input}
            placeholder="Search"
            placeholderTextColor="#aaa"
            onFocus={searchController?.activate}
            onBlur={searchController?.exit}
          />
          {!!searchQuery && (
            <Pressable onPress={searchController?.clear}>
              <Ionicons
                name="close"
                size={18}
                color="#888"
                style={styles.clearIcon}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    padding: 4,
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 8,
  },
});
