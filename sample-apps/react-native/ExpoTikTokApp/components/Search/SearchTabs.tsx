import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  SearchControllerState,
  useSearchContext,
  useStateStore,
} from '@stream-io/feeds-react-native-sdk';

const tabsNameMap = {
  feed: 'Users',
  activity: 'Posts',
};

const selector = (nextState: SearchControllerState) => ({
  sources: nextState.sources,
});

export const SearchTabs = () => {
  const searchController = useSearchContext();
  const { sources = [] } =
    useStateStore(searchController?.state, selector) ?? {};
  const [activeSource, setActiveSource] = useState(sources[0]);

  useEffect(() => {
    if (!searchController || !activeSource) return;
    searchController?.activateSource(activeSource.type);
    void activeSource.search(searchController.searchQuery);
  }, [activeSource, searchController]);

  return (
    <View style={styles.tabsRow}>
      {sources.map((source) => (
        <Pressable
          key={source.type}
          onPress={() => setActiveSource(source)}
          style={styles.tabButton}
        >
          <Text
            style={[
              styles.tabText,
              activeSource.type === source.type && styles.tabTextActive,
            ]}
          >
            {tabsNameMap[source.type as keyof typeof tabsNameMap] ??
              source.type}
          </Text>
          {activeSource.type === source.type && (
            <View style={styles.underline} />
          )}
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1a3c34',
  },
  underline: {
    height: 3,
    backgroundColor: '#1a3c34',
    width: '100%',
    marginTop: 6,
    borderRadius: 999,
  },
});
