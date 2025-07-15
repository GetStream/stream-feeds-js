import {
  ActivityResponse,
  useFeedContext,
  useStateStore,
} from '@stream-io/feeds-react-native-sdk';
import { FlatList, StyleSheet } from 'react-native';
import { Activity } from '@/components/Activity';

const renderItem = ({ item }: { item: ActivityResponse }) => (
  <Activity activity={item} />
);

export const Feed = () => {
  const feed = useFeedContext();
  const { hasNextPage, isLoading, activities } =
    useStateStore(feed?.state, (state) => ({
      isLoading: state.is_loading_activities,
      hasNextPage: typeof state.next !== 'undefined',
      activities: state.activities ?? [],
    })) ?? {};
  return (
    <FlatList
      data={activities}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
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
});
