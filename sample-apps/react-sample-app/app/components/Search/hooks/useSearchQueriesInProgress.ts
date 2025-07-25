import { useStateStore } from '@stream-io/feeds-client/react-bindings';
import { useEffect, useState } from 'react';
import type {
  SearchController,
  SearchControllerState,
  SearchSource,
} from '@stream-io/feeds-client';

const searchControllerStateSelector = (value: SearchControllerState) => ({
  sources: value.sources,
});

export type UseSearchQueriesInProgressParams = {
  searchController: SearchController;
};

export const useSearchQueriesInProgress = (
  searchController: SearchController,
) => {
  const [queriesInProgress, setQueriesInProgress] = useState<string[]>([]);
  const { sources } = useStateStore(
    searchController.state,
    searchControllerStateSelector,
  );

  useEffect(() => {
    const subscriptions = sources.map((source: SearchSource) =>
      source.state.subscribeWithSelector(
        (value) => ({ isLoading: value.isLoading }),
        ({ isLoading }) => {
          setQueriesInProgress((prev) => {
            if (isLoading) return prev.concat(source.type);
            return prev.filter((type) => type !== source.type);
          });
        },
      ),
    );

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [sources]);
  
  return queriesInProgress;
};
