import { FlatList, StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import type { AggregatedActivityResponse } from '@stream-io/feeds-react-native-sdk';
import {
  useAggregatedActivities,
  useFeedContext,
} from '@stream-io/feeds-react-native-sdk';
import { NotificationItem } from '@/components/notifications';

const ItemSeparator = () => <View style={styles.separator} />;

const renderItem = ({ item }: { item: AggregatedActivityResponse }) => (
  <NotificationItem aggregatedActivity={item} />
);

const keyExtractor = (item: AggregatedActivityResponse) => item.group;

export const Notifications = () => {
  const feed = useFeedContext();
  const { aggregated_activities } = useAggregatedActivities(feed) ?? {};

  return (
    <FlatList
      // @ts-expect-error FlatList internal
      strictMode={true}
      data={aggregated_activities}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={ItemSeparator}
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
