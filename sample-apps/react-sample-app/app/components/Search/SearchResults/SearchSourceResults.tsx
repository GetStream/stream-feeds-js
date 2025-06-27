import React from 'react';

import { SearchSourceResultList } from './SearchSourceResultList';
import { SearchSourceResultsEmpty } from './SearchSourceResultsEmpty';
import { SearchSourceResultsHeader } from './SearchSourceResultsHeader';
import { SearchSourceResultsContextProvider } from '../SearchSourceResultsContext';
import { useStateStore } from '@/app/hooks/useStateStore';
import { SearchSource, SearchSourceState } from '@stream-io/feeds-client';

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
