import type { SearchSource, SearchSourceState } from '@self';
import { useMemo } from 'react';
import { useSearchResultsContext } from '../../contexts/StreamSearchResultsContext';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import { useStableCallback } from '../internal';

export const useSearchResult = (sourceFromProps?: SearchSource) => {
  const sourceFromContext = useSearchResultsContext();
  const source = sourceFromProps ?? sourceFromContext;

  const { items, error, isLoading, hasNext } =
    useStateStore(source?.state, selector) ?? {};

  const loadMore = useStableCallback(async () => {
    if (hasNext) {
      source?.search();
    }
  });

  return useMemo(
    () => ({ items, error, isLoading, hasNext, loadMore }),
    [error, hasNext, isLoading, items, loadMore],
  );
};

const selector = ({
  items,
  isLoading,
  hasNext,
  lastQueryError,
}: SearchSourceState) => ({
  items,
  isLoading,
  hasNext,
  error: lastQueryError,
});
