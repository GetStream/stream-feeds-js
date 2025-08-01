import React from 'react';
import { useStateStore } from '@stream-io/feeds-react-sdk';
import type { SearchSourceState } from '@stream-io/feeds-react-sdk';

import { SearchSourceResultsLoadingIndicator } from './SearchSourceResultsLoadingIndicator';
import { useSearchSourceResultsContext } from '../SearchSourceResultsContext';

const searchSourceStateSelector = (value: SearchSourceState) => ({
  hasNext: value.hasNext,
  isLoading: value.isLoading,
});

export const SearchSourceResultListFooter = () => {
  const { searchSource } = useSearchSourceResultsContext();
  const { hasNext, isLoading } = useStateStore(
    searchSource.state,
    searchSourceStateSelector,
  );

  return (
    <div
      className="flex justify-center"
      data-testid="search-footer"
    >
      {isLoading ? (
        <SearchSourceResultsLoadingIndicator />
      ) : !hasNext ? (
        <div className="str-chat__search-source-results---empty">
          {'All results loaded'}
        </div>
      ) : (
        <button onClick={() => searchSource.search()} className="text-sm px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none">
        Load more
        </button>
      )}
    </div>
  );
};
