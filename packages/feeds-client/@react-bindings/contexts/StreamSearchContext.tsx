import { createContext, useContext } from 'react';
import type { SearchController } from '../../src/common/search';

export const StreamSearchContext = createContext<SearchController | undefined>(undefined);

/**
 * The props for the StreamSearchProvider component.
 */
export type StreamSearchContextProps = {
  searchController: SearchController;
};

/**
 * Hook to access the nearest SearchController2 instance.
 */
export const useSearchContext = () => {
  return useContext(StreamSearchContext);
};
