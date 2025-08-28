import { PropsWithChildren } from 'react';
import { StreamSearchContext } from '../contexts/StreamSearchContext';
import type { SearchController } from '../../src/common/search';

/**
 * The props for the StreamSearch component. It accepts a `SearchController` instance.
 */
export type StreamSearchProps = {
  searchController: SearchController | undefined;
};

export const StreamSearch = ({
  searchController,
  children,
}: PropsWithChildren<StreamSearchProps>) => {
  return (
    <StreamSearchContext.Provider value={searchController}>
      {children}
    </StreamSearchContext.Provider>
  );
};

StreamSearch.displayName = 'StreamSearch';
