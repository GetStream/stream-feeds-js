import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useNotificationStatus } from './useNotificationStatus';
import { useMemo } from 'react';
import { AggregatedActivityResponse } from '../../../src/gen/models';
import { Feed } from '../../../src/feed';

export const useIsAggregatedActivitySeen = ({
  feed: feedFromProps,
  aggregatedActivity,
}: {
  feed?: Feed;
  aggregatedActivity: AggregatedActivityResponse;
}) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const { seen_activities: seenActivities } = useNotificationStatus(feed) ?? {};

  const group = aggregatedActivity.group;

  return useMemo(
    () => (seenActivities ?? []).includes(group),
    [seenActivities, group],
  );
};
