import React from 'react';
import type { ComponentType } from 'react';
import type {
  SearchSourceState,
  SearchSourceType,
} from '@stream-io/feeds-client';

import { DefaultSearchResultItems } from './SearchResultItem';
import { SearchSourceResultListFooter } from './SearchSourceResultListFooter';
import { useSearchSourceResultsContext } from '../SearchSourceResultsContext';
import type { SearchResultItemComponents } from './SearchResultItem';
import { useStateStore } from '@/app/hooks/useStateStore';

const searchSourceStateSelector = (nextValue: SearchSourceState) => ({
  items: nextValue.items,
});

export type SearchSourceResultListProps = {
  loadMoreDebounceMs?: number;
  loadMoreThresholdPx?: number;
  SearchResultItems?: SearchResultItemComponents;
};

export const SearchSourceResultList = ({
  // loadMoreDebounceMs = 100,
  // loadMoreThresholdPx = 80,
  SearchResultItems = DefaultSearchResultItems,
}: SearchSourceResultListProps) => {
  const { searchSource } = useSearchSourceResultsContext();
  const { items } = useStateStore(
    searchSource.state,
    searchSourceStateSelector,
  );

  const SearchResultItem = SearchResultItems[
    searchSource.type as SearchSourceType
  ] as ComponentType<{ item: unknown }>;

  if (!SearchResultItem) return null;

  return (
    <div
      className="flex flex-col p-2"
      data-testid="search-source-result-list"
    >
      {items?.map((item, i) => (
        <SearchResultItem
          item={item}
          key={`source-search-result-${searchSource.type}-${i}`}
        />
      ))}
      <SearchSourceResultListFooter />
    </div>
  );
};
