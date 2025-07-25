import { useSearchResult } from '@stream-io/feeds-react-native-sdk';
import { ActivitySectionList } from '@/components/ActivitySectionList';

export const ActivitySourceResultList = () => {
  const {
    items: activities,
    error,
    isLoading,
    hasNext,
    loadMore,
  } = useSearchResult();

  return (
    <ActivitySectionList
      activities={activities}
      error={error}
      is_loading={isLoading}
      has_next_page={hasNext}
      loadNextPage={loadMore}
    />
  );
};
