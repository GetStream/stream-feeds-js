import {
  SearchController,
  StreamSearch,
  useFeedsClient,
  UserSearchSource,
} from '@stream-io/feeds-react-native-sdk';
import { PropsWithChildren, useMemo } from 'react';

export const Mentions = ({ children }: PropsWithChildren) => {
  const client = useFeedsClient();
  const searchController = useMemo(() => {
    if (!client) {
      return;
    }

    return new SearchController({
      sources: [new UserSearchSource(client, { allowEmptySearchString: true })],
    });
  }, [client]);

  if (!client || !searchController) {
    return null;
  }

  return (
    <StreamSearch searchController={searchController}>{children}</StreamSearch>
  );
};
