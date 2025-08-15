import { Feed, FeedState } from '../../../src/feed';
import { useStateStore } from '../useStateStore';

const selector = ({ aggregated_activities }: FeedState) => ({
  aggregated_activities,
});

type UseAggregatedActivitiesReturnType = ReturnType<typeof selector>;

/**
 * A React hook that returns a reactive object containing the current aggregated activities.
 */
export function useAggregatedActivities(
  notificationFeed: Feed,
): UseAggregatedActivitiesReturnType;
export function useAggregatedActivities(
  notificationFeed?: Feed,
): UseAggregatedActivitiesReturnType | undefined;
export function useAggregatedActivities(notificationFeed?: Feed) {
  return useStateStore(notificationFeed?.state, selector);
}
