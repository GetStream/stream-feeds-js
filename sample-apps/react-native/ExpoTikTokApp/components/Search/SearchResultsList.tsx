import {
  SearchSourceState,
  useSearchResultsContext,
  useStateStore,
} from '@stream-io/feeds-react-native-sdk';
import { View, Text } from '@/components/Themed';

const selector = (nextState: SearchSourceState) => ({
  items: nextState.items,
});

export const SearchResultsList = () => {
  const source = useSearchResultsContext();
  const { items } = useStateStore(source?.state, selector) ?? {};

  return items
    ? items.map((item) => (
        <View key={item.id}>
          <Text>{item.id}</Text>
        </View>
      ))
    : null;
};
