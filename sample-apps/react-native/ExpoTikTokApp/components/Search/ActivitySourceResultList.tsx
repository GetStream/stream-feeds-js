import {
  type SearchSourceState,
  useSearchResultsContext,
  useStateStore,
} from '@stream-io/feeds-react-native-sdk';
import { ActivitySectionList } from '@/components/ActivitySectionList';
import { useStableCallback } from '@/hooks/useStableCallback';

const searchSourceSelector = (nextState: SearchSourceState) => ({
  items: nextState.items,
  isLoading: nextState.isLoading,
  hasNext: nextState.hasNext,
  error: nextState.lastQueryError,
});

export const ActivitySourceResultList = () => {
  const searchSource = useSearchResultsContext();

  const {
    items: activities,
    error,
    isLoading,
    hasNext,
  } = useStateStore(searchSource?.state, searchSourceSelector) ?? {};

  const loadMore = useStableCallback(async () => {
    if (!isLoading && hasNext) {
      searchSource?.search(searchSource?.searchQuery);
    }
  });

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
