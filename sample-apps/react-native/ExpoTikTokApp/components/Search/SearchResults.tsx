import {
  SearchControllerState,
  StreamSearchResults,
  useSearchContext,
  useStateStore,
} from '@stream-io/feeds-react-native-sdk';
import { useMemo } from 'react';
import { SearchResultsList } from '@/components/Search/SearchResultsList';

const selector = (nextValue: SearchControllerState) => ({
  sources: nextValue.sources,
});

export const SearchResults = () => {
  const searchController = useSearchContext();
  const { sources = [] } =
    useStateStore(searchController?.state, selector) ?? {};

  const activeSource = useMemo(
    () => sources.find((source) => source.isActive),
    [sources],
  );

  console.log('ACTIVE SOURCE: ', activeSource);

  if (!activeSource) {
    return null;
  }

  return (
    <StreamSearchResults source={activeSource}>
      <SearchResultsList />
    </StreamSearchResults>
  );
};
