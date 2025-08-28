import { PropsWithChildren } from 'react';
import { StreamSearchResultsContext } from '../contexts/StreamSearchResultsContext';
import type { SearchSource } from '../../src/common/search';

/**
 * The props for the StreamSearchResults component. It accepts a `SearchSource` instance.
 */
export type StreamSearchResultsProps = {
  source: SearchSource;
};

export const StreamSearchResults = ({
  source,
  children,
}: PropsWithChildren<StreamSearchResultsProps>) => {
  return (
    <StreamSearchResultsContext.Provider value={source}>
      {children}
    </StreamSearchResultsContext.Provider>
  );
};

StreamSearchResults.displayName = 'StreamSearchResults';
