import type { Feed } from '../../../../feed';
import type { AggregatedActivityResponse } from '../../../../gen/models';

/**
 * @deprecated use aggregatedActivity.is_read instead
 * @returns
 */
export const useIsAggregatedActivityRead = ({
  feed: _,
  aggregatedActivity,
}: {
  feed?: Feed;
  aggregatedActivity: AggregatedActivityResponse;
}) => {
  return aggregatedActivity.is_read;
};
