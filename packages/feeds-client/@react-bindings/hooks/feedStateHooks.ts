import { useFeedContext } from '../contexts/StreamFeedContext';
import type { FeedState } from '../../src/Feed';
import { useStateStore } from './useStateStore';

/**
 * A React hook that returns a reactive object containing the current activities,
 * loading state and whether there is a next page to paginate to or not.
 */
export const useFeedActivities = () => {
  const feed = useFeedContext();

  return useStateStore(feed?.state, feedActivitiesSelector);
};

const feedActivitiesSelector = (nextState: FeedState) => ({
  isLoading: nextState.is_loading_activities,
  hasNextPage: typeof nextState.next !== 'undefined',
  activities: nextState.activities ?? [],
});
