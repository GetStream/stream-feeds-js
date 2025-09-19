import type { Feed, FeedState } from '@self';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useMemo } from 'react';
import { useStableCallback } from '../internal';

const selector = ({
  is_loading_activities,
  next,
  aggregated_activities = [],
}: FeedState) => ({
  is_loading: is_loading_activities,
  has_next_page: typeof next !== 'undefined',
  aggregated_activities,
});

type UseAggregatedActivitiesReturnType = ReturnType<typeof selector> & {
  loadNextPage: () => Promise<void>;
};

/**
 * A React hook that returns a reactive object containing the current aggregated activities,
 * loading state and whether there is a next page to paginate to or not.
 */
export function useAggregatedActivities(
  feedFromProps: Feed,
): UseAggregatedActivitiesReturnType;
export function useAggregatedActivities(
  feedFromProps?: Feed,
): UseAggregatedActivitiesReturnType | undefined;
export function useAggregatedActivities(feedFromProps?: Feed) {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const data = useStateStore(feed?.state, selector);

  const loadNextPage = useStableCallback(async () => {
    if (!feed || !data?.has_next_page || data?.is_loading) {
      return;
    }

    await feed.getNextPage();
  });

  return useMemo(
    () => (data ? { ...data, loadNextPage } : undefined),
    [data, loadNextPage],
  );
}
