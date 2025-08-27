import { useMemo } from 'react';
import {
  ActivitySearchSource,
  FeedSearchSource,
  SearchController,
  StreamSearch,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchTabs } from '@/components/search/SearchTabs';
import { SearchResults } from '@/components/search/SearchResults';
import { LocationSearchSource } from '@/components/search/sources/LocationSearchSource';

export const Search = () => {
  const client = useFeedsClient();
  const searchController = useMemo(() => {
    if (!client) {
      return undefined;
    }

    return new SearchController({
      sources: [
        new ActivitySearchSource(client, { allowEmptySearchString: true }),
        new FeedSearchSource(client, {
          groupId: 'timeline',
          allowEmptySearchString: true,
        }),
        new LocationSearchSource(client, { allowEmptySearchString: true }),
      ],
      config: { keepSingleActiveSource: true },
    });
  }, [client]);

  return (
    <StreamSearch searchController={searchController}>
      <SearchBar />
      <SearchTabs />
      <SearchResults />
    </StreamSearch>
  );
};
