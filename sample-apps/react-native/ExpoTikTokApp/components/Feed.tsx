import React from 'react';
import {
  ActivityResponse,
  useFeedContext,
  useFeedActivities,
} from '@stream-io/feeds-react-native-sdk';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Activity } from '@/components/Activity';
import { useCallback, useState } from 'react';

const renderItem = ({
  item,
  index,
}: {
  item: ActivityResponse;
  index: number;
}) => <Activity activity={item} index={index} />;

const keyExtractor = (item: ActivityResponse) => item.id;

export const Feed = () => {
  const [error, setError] = useState<Error | undefined>();
  const feed = useFeedContext();
  const { hasNextPage, isLoading, activities } = useFeedActivities() ?? {};

  const getNextPage = useCallback(() => {
    if (!feed || !hasNextPage || isLoading) {
      return;
    }
    setError(undefined);
    feed.getNextPage().catch(setError);
  }, [hasNextPage, isLoading, feed]);

  const hasActivities = activities?.length && activities.length > 0;

  const ListFooterComponent = useCallback(
    () => (isLoading && hasActivities ? <ActivityIndicator /> : null),
    [isLoading, hasActivities],
  );

  if (error) {
    return (
      <View style={styles.midScreenContainer}>
        <Text style={styles.errorText}>
          Something went wrong while loading activities.
        </Text>
      </View>
    );
  }

  if (isLoading && activities?.length === 0) {
    return (
      <View style={styles.midScreenContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      // @ts-expect-error Using FlatList internal
      strictMode={true}
      data={activities}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      onEndReachedThreshold={0.2}
      onEndReached={getNextPage}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      ListFooterComponent={ListFooterComponent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  midScreenContainer: {
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  columnWrapper: { justifyContent: 'space-between' },
});
