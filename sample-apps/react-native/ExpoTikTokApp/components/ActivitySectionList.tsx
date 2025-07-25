import React from 'react';
import {
  ActivityResponse,
  useFeedActivities,
} from '@stream-io/feeds-react-native-sdk';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { Activity } from '@/components/Activity';
import { useCallback } from 'react';
import { LoadingIndicator, ErrorIndicator } from '@/components/Indicators';
import { useStableCallback } from '@/hooks/useStableCallback';
import { View } from '@/components/Themed';

const renderItem = ({
  item,
  index,
}: {
  item: ActivityResponse;
  index: number;
}) => <Activity activity={item} index={index} />;

const keyExtractor = (item: ActivityResponse) => item.id;

export const ActivitySectionList = ({
  activities,
  is_loading: isLoading,
  loadNextPage: loadNextPageProp,
  error,
  has_next_page: hasNextPage,
}: ReturnType<typeof useFeedActivities> & { error?: Error }) => {
  const hasActivities = activities?.length && activities.length > 0;

  const loadNextPage = useStableCallback(() => {
    if (!isLoading && hasNextPage) {
      void loadNextPageProp();
    }
  });

  const ListFooterComponent = useCallback(
    () => (isLoading && hasActivities ? <ActivityIndicator /> : null),
    [isLoading, hasActivities],
  );

  if (error) {
    return <ErrorIndicator context="activities" />;
  }

  if (isLoading && (!activities || activities?.length === 0)) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        // @ts-expect-error Using FlatList internal
        strictMode={true}
        data={activities}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        onEndReachedThreshold={0.2}
        onEndReached={loadNextPage}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
