import { Feed, FeedState } from '../../../src/feed';
import { useStateStore } from '../useStateStore';
import { useFeedContext } from '../../contexts/StreamFeedContext';

const selector = ({ aggregated_activities }: FeedState) => ({
  aggregated_activities,
});

type UseAggregatedActivitiesReturnType = ReturnType<typeof selector>;

/**
 * A React hook that returns a reactive object containing the current aggregated activities.
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

  return useStateStore(feed?.state, selector);
}
