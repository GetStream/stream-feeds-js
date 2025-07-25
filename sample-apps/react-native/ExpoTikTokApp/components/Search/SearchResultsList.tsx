import {
  SearchSourceState,
  useSearchResultsContext,
  useStateStore,
} from '@stream-io/feeds-react-native-sdk';
import { View, Text } from '@/components/Themed';
import { FeedSourceResultList } from '@/components/Search/FeedSourceResultList';

const selector = (nextState: SearchSourceState) => ({
  items: nextState.items,
});

export const SearchResultsList = () => {
  const source = useSearchResultsContext();
  const { items } = useStateStore(source?.state, selector) ?? {};

  if (!source) return null;

  return source.type === 'feed'
    ? <FeedSourceResultList />
    : items?.map((item) => (
      <View key={item.id}>
        <Text>{item.id}</Text>
      </View>
    ));
};
