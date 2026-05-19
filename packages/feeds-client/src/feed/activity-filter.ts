import { itemMatchesFilter, resolveDotPathValue } from '@stream-io/filter';
import type {
  ActivityResponse,
  AggregatedActivityResponse,
  GetOrCreateFeedRequest,
} from '../gen/models';

/**
 * Resolvers that map feed filter field names to activity properties.
 * - activity_type: API filter key maps to activity.type
 * - within_bounds: API filter key maps to activity.location (for bounds check)
 */
const activityResolvers = [
  {
    matchesField: (field: string) => field === 'activity_type',
    resolve: (activity: ActivityResponse) => activity.type,
  },
  {
    matchesField: (field: string) => field === 'within_bounds',
    resolve: (activity: ActivityResponse) => activity.location,
  },
  {
    matchesField: () => true,
    resolve: (item: any, path: any) => resolveDotPathValue(item, path),
  },
] as const;

/**
 * Returns true if the activity matches the feed's getOrCreate filter (e.g. filter_tags, activity_type, within_bounds).
 * Use this inside onNewActivity to only add activities that match the current feed filter.
 *
 * @param activity - The activity to check
 * @param requestConfig - The last getOrCreate request config (contains the filter). If omitted or filter is empty, returns true.
 * @returns true if the activity matches the filter or there is no filter
 */
export function activityFilter(
  activity: ActivityResponse,
  requestConfig?: GetOrCreateFeedRequest,
): boolean {
  const filter = requestConfig?.filter;
  if (!filter || typeof filter !== 'object') {
    return true;
  }
  return itemMatchesFilter(activity, filter, {
    resolvers: [...activityResolvers],
    arrayEqMode: 'contains',
  });
}

/**
 * Applies the feed's getOrCreate filter to an array of aggregated activity groups.
 *
 * For each group, individual activities that don't match the filter are removed.
 * A group is kept only if at least one activity matches; otherwise the whole
 * group is dropped. Server-aggregated metadata (`activity_count`, `user_count`,
 * `score`, etc.) is preserved as-is — only the `activities` array is trimmed.
 *
 * If `requestConfig` has no filter (or an empty filter), the input array is
 * returned as-is to preserve referential equality.
 */
export function filterAggregatedActivities(
  aggregatedActivities: AggregatedActivityResponse[],
  requestConfig?: GetOrCreateFeedRequest,
): AggregatedActivityResponse[] {
  const filter = requestConfig?.filter;
  if (
    !filter ||
    typeof filter !== 'object' ||
    Object.keys(filter).length === 0
  ) {
    return aggregatedActivities;
  }

  const result: AggregatedActivityResponse[] = [];
  for (const group of aggregatedActivities) {
    const matching = group.activities.filter((activity) =>
      activityFilter(activity, requestConfig),
    );
    if (matching.length > 0) {
      result.push({ ...group, activities: matching });
    }
  }
  return result;
}
