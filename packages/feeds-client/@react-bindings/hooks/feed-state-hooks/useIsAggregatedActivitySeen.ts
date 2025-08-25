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

  const { seen_activities: seenActivities, last_seen_at: lastSeenAt } =
    useNotificationStatus(feed) ?? {};

  const group = aggregatedActivity.group;

  return useMemo(
    () =>
      (lastSeenAt &&
        aggregatedActivity.updated_at.getTime() < lastSeenAt.getTime()) ||
      (seenActivities ?? []).includes(group),
    [lastSeenAt, aggregatedActivity.updated_at, seenActivities, group],
  );
};
