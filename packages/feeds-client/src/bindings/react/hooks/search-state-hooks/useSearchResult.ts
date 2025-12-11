import { useMemo } from 'react';
import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useSearchResultsContext } from '../../contexts/StreamSearchResultsContext';
import { useStableCallback } from '../internal';
import type { SearchSourceState } from '../../../../common/types';
import type { SearchSource } from '../../../../common/search';

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
