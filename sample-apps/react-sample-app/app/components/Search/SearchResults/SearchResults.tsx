import React from 'react';
import type { SearchControllerState } from '@stream-io/feeds-react-sdk';
import { useStateStore } from '@stream-io/feeds-react-sdk';

import { SearchSourceResults } from './SearchSourceResults';
import { SearchResultsPresearch } from './SearchResultsPresearch';
import { useSearchContext } from '../SearchContext';

const searchControllerStateSelector = (nextValue: SearchControllerState) => ({
  activeSources: nextValue.sources.filter((s) => s.isActive),
  isActive: nextValue.isActive,
  searchQuery: nextValue.searchQuery,
});

export const SearchResults = () => {
  const { searchController } = useSearchContext();
  const { activeSources, isActive, searchQuery } = useStateStore(
    searchController.state,
    searchControllerStateSelector,
  );

  return !isActive ? null : (
    <div
      aria-label={'aria/Search results'}
      className="flex absolute overflow-y-auto w-full top-full mt-0.5 max-h-64 bg-white border border-gray-200 rounded-md shadow"
    >
      {/* <SearchResultsHeader /> */}
      {!searchQuery ? (
        <SearchResultsPresearch activeSources={activeSources} />
      ) : (
        activeSources.map((source) => (
          <SearchSourceResults key={source.type} searchSource={source} />
        ))
      )}
    </div>
  );
};
