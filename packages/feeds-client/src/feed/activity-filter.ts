import { itemMatchesFilter, resolveDotPathValue } from '@stream-io/filter';
import type { ActivityResponse, GetOrCreateFeedRequest } from '../gen/models';

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
