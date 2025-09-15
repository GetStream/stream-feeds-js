import { useFeedContext } from '../../contexts/StreamFeedContext';
import type { Feed, FeedState } from '@self';
import { useStateStore } from '../useStateStore';
import { useMemo } from 'react';
import { useStableCallback } from '../internal';

/**
 * A React hook that returns a reactive object containing the current activities,
 * loading state and whether there is a next page to paginate to or not.
 */
export const useFeedActivities = (feedFromProps?: Feed) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const data = useStateStore(feed?.state, selector);

  const loadNextPage = useStableCallback(async () => {
    if (!feed || !data?.has_next_page || data?.is_loading) {
      return;
    }

    await feed.getNextPage();
  });

  return useMemo(() => ({ ...data, loadNextPage }), [data, loadNextPage]);
};

const selector = ({
  is_loading_activities,
  next,
  activities = [],
}: FeedState) => ({
  is_loading: is_loading_activities,
  has_next_page: typeof next !== 'undefined',
  activities,
});
