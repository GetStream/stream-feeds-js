import type {
  SearchSource,
  SearchSourceState,
} from '../../../src/common/BaseSearchSource';
import { useSearchResultsContext } from '../../contexts/StreamSearchResultsContext';
import { useStateStore } from '../useStateStore';
import { useStableCallback } from '../internal';
import { useMemo } from 'react';

export const useSearchResult = (sourceFromProps?: SearchSource) => {
  const sourceFromContext = useSearchResultsContext();
  const source = sourceFromProps ?? sourceFromContext;

  const { items, error, isLoading, hasNext } =
    useStateStore(source?.state, selector) ?? {};

  const loadMore = useStableCallback(async () => {
    if (!isLoading && hasNext) {
      source?.search(source?.searchQuery);
    }
  });

  return useMemo(
    () => ({ items, error, isLoading, hasNext, loadMore }),
    [error, hasNext, isLoading, items, loadMore],
  );
};

const selector = (nextState: SearchSourceState) => ({
  items: nextState.items,
  isLoading: nextState.isLoading,
  hasNext: nextState.hasNext,
  error: nextState.lastQueryError,
});
