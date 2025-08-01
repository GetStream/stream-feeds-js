import clsx from 'clsx';
import React from 'react';
import type { SearchSource, SearchSourceState } from '@stream-io/feeds-react-sdk';
import { useStateStore } from '@stream-io/feeds-react-sdk';

import { useSearchContext } from '../SearchContext';

const searchSourceStateSelector = (nextValue: SearchSourceState) => ({
  isActive: nextValue.isActive,
});

type SearchSourceFilterButtonProps = {
  source: SearchSource;
};

const SearchSourceFilterButton = ({
  source,
}: SearchSourceFilterButtonProps) => {
  const { searchController } = useSearchContext();
  const { isActive } = useStateStore(source.state, searchSourceStateSelector);
  const label = `${source.type}`;
  return (
    <button
      aria-label={'aria/Search results header filter button'}
      className={clsx(' border px-1 border-blue-200 rounded-md', {
        'bg-blue-400': isActive,
        'bg-white': !isActive,
      })}
      key={label}
      onClick={() => {
        if (source.isActive) {
          searchController.deactivateSource(source.type);
        } else {
          searchController.activateSource(source.type);
          if (searchController.searchQuery && !source.items?.length) {
            void source.search(searchController.searchQuery);
          }
        }
      }}
    >
      {label}
    </button>
  );
};

export const SearchSourceFilters = () => {
  const { searchController } = useSearchContext();
  return (
    <div className="flex gap-1" data-testid="filter-source-buttons">
      {searchController.sources.map((source) => (
        <SearchSourceFilterButton
          key={`search-source-filter-button-${source.type}`}
          source={source}
        />
      ))}
    </div>
  );
};
