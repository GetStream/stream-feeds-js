import { createContext, useContext } from 'react';
import type { SearchSource } from '../../src/common/search';

export const StreamSearchResultsContext = createContext<SearchSource | undefined>(undefined);

/**
 * The props for the StreamSearchResultsProvider component.
 */
export type StreamSearchResultsContextProps = {
  source: SearchSource;
};

/**
 * Hook to access the nearest SearchSource instance.
 */
export const useSearchResultsContext = () => {
  return useContext(StreamSearchResultsContext);
};
