import {
  StreamSearchResults, useSearchContext,
  useSearchSources,
} from '@stream-io/feeds-react-native-sdk';
import { PropsWithChildren, useEffect, useMemo } from 'react';

export const MentionSearchResults = ({ children }: PropsWithChildren) => {
  const searchController = useSearchContext();
  const { sources = [] } = useSearchSources() ?? {};

  const activeSource = useMemo(
    () => sources.find((source) => source.isActive),
    [sources],
  );

  useEffect(() => {
    if (!searchController) return;
    searchController?.activateSource('user');
    if (activeSource && !activeSource.items?.length) {
      void activeSource.search(searchController.searchQuery);
    }
  }, [activeSource, searchController]);

  if (!activeSource) {
    return null;
  }

  return (
    <StreamSearchResults source={activeSource}>
      {children}
    </StreamSearchResults>
  );
};
