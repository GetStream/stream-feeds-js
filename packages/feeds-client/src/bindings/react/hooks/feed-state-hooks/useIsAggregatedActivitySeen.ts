import type { Feed } from '../../../../feed';
import type { AggregatedActivityResponse } from '../../../../gen/models';

/**
 * @deprecated use aggregatedActivity.is_seen instead
 * @returns
 */
export const useIsAggregatedActivitySeen = ({
  feed: _,
  aggregatedActivity,
}: {
  feed?: Feed;
  aggregatedActivity: AggregatedActivityResponse;
}) => {
  return aggregatedActivity.is_seen;
};
