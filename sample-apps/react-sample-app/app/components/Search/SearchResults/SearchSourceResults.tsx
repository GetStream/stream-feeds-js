import React from 'react';
import type { SearchSource, SearchSourceState } from '@stream-io/feeds-react-sdk';
import { useStateStore } from '@stream-io/feeds-react-sdk';

import { SearchSourceResultList } from './SearchSourceResultList';
import { SearchSourceResultsEmpty } from './SearchSourceResultsEmpty';
import { SearchSourceResultsHeader } from './SearchSourceResultsHeader';
import { SearchSourceResultsContextProvider } from '../SearchSourceResultsContext';

const searchSourceStateSelector = (nextValue: SearchSourceState) => ({
  isLoading: nextValue.isLoading,
  items: nextValue.items,
});

export type SearchSourceResultsProps = { searchSource: SearchSource };

export const SearchSourceResults = ({
  searchSource,
}: SearchSourceResultsProps) => {
  const { isLoading, items } = useStateStore(
    searchSource.state,
    searchSourceStateSelector,
  );

  if (!items && !isLoading) return null;

  return (
    <SearchSourceResultsContextProvider value={{ searchSource }}>
      <div
        className="flex flex-col w-full"
        data-testid="search-source-results"
      >
        <SearchSourceResultsHeader />
        {items?.length || isLoading ? (
          <SearchSourceResultList />
        ) : (
          <SearchSourceResultsEmpty />
        )}
      </div>
    </SearchSourceResultsContextProvider>
  );
};
