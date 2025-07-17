import { useFeedContext } from '../../contexts/StreamFeedContext';
import type { FeedState } from '../../../src/Feed';
import { useStateStore } from '../useStateStore';
import { useMemo } from 'react';
import { useStableCallback } from '../internal';

/**
 * A React hook that returns a reactive object containing the current activities,
 * loading state and whether there is a next page to paginate to or not.
 */
export const useFeedActivities = () => {
  const feed = useFeedContext();

  const data = useStateStore(feed?.state, selector)

  const loadNextPage = useStableCallback(async () => {
    if (!feed || !data?.hasNextPage || data?.isLoading) {
      return;
    }

    await feed.getNextPage();
  });

  return useMemo(() => ({ ...data, loadNextPage }), [data, loadNextPage]);
};

const selector = (nextState: FeedState) => ({
  isLoading: nextState.is_loading_activities,
  hasNextPage: typeof nextState.next !== 'undefined',
  activities: nextState.activities ?? [],
});
