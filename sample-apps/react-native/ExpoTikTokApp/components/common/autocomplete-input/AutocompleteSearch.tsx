import {
  FeedSearchSource,
  SearchController,
  StreamSearch,
  useFeedsClient,
  UserSearchSource,
} from '@stream-io/feeds-react-native-sdk';
import { PropsWithChildren, useMemo } from 'react';

export const AutocompleteSearch = ({ children }: PropsWithChildren) => {
  const client = useFeedsClient();
  const searchController = useMemo(() => {
    if (!client) {
      return;
    }

    return new SearchController({
      sources: [
        new UserSearchSource(client, {
          allowEmptySearchString: true,
          resetOnNewSearchQuery: false,
        }),
        new FeedSearchSource(client, {
          groupId: 'hashtag',
          allowEmptySearchString: true,
          resetOnNewSearchQuery: false,
        }),
      ],
      config: { keepSingleActiveSource: true },
    });
  }, [client]);

  if (!client || !searchController) {
    return null;
  }

  return (
    <StreamSearch searchController={searchController}>{children}</StreamSearch>
  );
};
