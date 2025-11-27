import {
  StreamSearchResults, useSearchContext,
  useSearchSources,
} from '@stream-io/feeds-react-native-sdk';
import type { PropsWithChildren} from 'react';
import { useEffect, useMemo } from 'react';

export const AutocompleteSearchResults = ({ children }: PropsWithChildren) => {
  const searchController = useSearchContext();
  const { sources = [] } = useSearchSources() ?? {};

  const activeSource = useMemo(
    () => sources.find((source) => source.isActive),
    [sources],
  );

  useEffect(() => {
    if (!searchController) return;
    searchController?.activateSource('user');
  }, [searchController]);

  if (!activeSource) {
    return null;
  }

  return (
    <StreamSearchResults source={activeSource}>
      {children}
    </StreamSearchResults>
  );
};
