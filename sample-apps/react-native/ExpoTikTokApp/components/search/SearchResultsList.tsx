import { useSearchResultsContext } from '@stream-io/feeds-react-native-sdk';
import { FeedSourceResultList } from '@/components/search/FeedSourceResultList';
import { ActivitySourceResultList } from '@/components/search/ActivitySourceResultList';

export const SearchResultsList = () => {
  const source = useSearchResultsContext();

  if (!source) return null;

  return source.type === 'feed' ? (
    <FeedSourceResultList />
  ) : (
    <ActivitySourceResultList />
  );
};
