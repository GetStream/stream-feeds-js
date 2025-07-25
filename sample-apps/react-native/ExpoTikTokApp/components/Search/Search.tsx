import { useMemo } from 'react';
import {
  ActivitySearchSource,
  FeedSearchSource,
  SearchController,
  StreamSearch,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { SearchBar } from '@/components/Search/SearchBar';
import { SearchTabs } from '@/components/Search/SearchTabs';
import { SearchResults } from '@/components/Search/SearchResults';

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
          groupId: 'user',
          allowEmptySearchString: true,
        }),
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
