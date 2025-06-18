import React from 'react';
import { useSearchSourceResultsContext } from '../SearchSourceResultsContext';

export const SearchSourceResultsLoadingIndicator = () => {
  const { searchSource } = useSearchSourceResultsContext();
  return (
    <div
      className="str-chat__search-source-results__loading-indicator"
      data-testid="search-loading-indicator"
    >
      Searching for {searchSource.type}...
    </div>
  );
};
