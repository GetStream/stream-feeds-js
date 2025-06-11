import React from 'react';
import type { SearchSourceState } from '@stream-io/feeds-client';

import { SearchSourceResultsLoadingIndicator } from './SearchSourceResultsLoadingIndicator';
import { useSearchSourceResultsContext } from '../SearchSourceResultsContext';
import { useStateStore } from '@/app/hooks/useStateStore';

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
      className="str-chat__search-source-result-list__footer"
      data-testid="search-footer"
    >
      {isLoading ? (
        <SearchSourceResultsLoadingIndicator />
      ) : !hasNext ? (
        <div className="str-chat__search-source-results---empty">
          {'All results loaded'}
        </div>
      ) : null}
    </div>
  );
};
