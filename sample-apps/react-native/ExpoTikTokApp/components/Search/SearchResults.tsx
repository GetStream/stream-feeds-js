import {
  StreamSearchResults,
  useSearchSources,
} from '@stream-io/feeds-react-native-sdk';
import { useMemo } from 'react';
import { SearchResultsList } from '@/components/Search/SearchResultsList';

export const SearchResults = () => {
  const { sources = [] } = useSearchSources() ?? {};

  const activeSource = useMemo(
    () => sources.find((source) => source.isActive),
    [sources],
  );

  if (!activeSource) {
    return null;
  }

  return (
    <StreamSearchResults source={activeSource}>
      <SearchResultsList />
    </StreamSearchResults>
  );
};
