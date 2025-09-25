import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { View } from '@/components/common/Themed';
import type { AggregatedActivityResponse } from '@stream-io/feeds-react-native-sdk';
import {
  useAggregatedActivities,
  useFeedContext,
} from '@stream-io/feeds-react-native-sdk';
import { NotificationItem } from '@/components/notifications/Notification';
import React, { useCallback, useState } from 'react';
import { useStableCallback } from '../../hooks/useStableCallback';
import { ErrorIndicator, LoadingIndicator } from '../indicators';

const ItemSeparator = () => <View style={styles.separator} />;

const renderItem = ({ item }: { item: AggregatedActivityResponse }) => (
  <NotificationItem aggregatedActivity={item} />
);

const keyExtractor = (item: AggregatedActivityResponse) => item.group;

export const Notifications = () => {
  const [error, setError] = useState<Error | undefined>();

  const feed = useFeedContext();
  const {
    aggregated_activities,
    loadNextPage,
    is_loading: isLoading,
  } = useAggregatedActivities(feed) ?? {};

  const hasAggregatedActivities =
    aggregated_activities?.length && aggregated_activities.length > 0;

  const ListFooterComponent = useCallback(
    () => (isLoading && hasAggregatedActivities ? <ActivityIndicator /> : null),
    [isLoading, hasAggregatedActivities],
  );

  const getNextPage = useStableCallback(async () => {
    setError(undefined);
    loadNextPage().catch(setError);
  });

  if (error) {
    return <ErrorIndicator context="notifications" />;
  }

  if (
    isLoading &&
    (!aggregated_activities || aggregated_activities?.length === 0)
  ) {
    return <LoadingIndicator />;
  }

  return (
    <FlatList
      // @ts-expect-error FlatList internal
      strictMode={true}
      data={aggregated_activities}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReachedThreshold={0.2}
      onEndReached={getNextPage}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={ItemSeparator}
      ListFooterComponent={ListFooterComponent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F9',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
