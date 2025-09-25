import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useNotificationStatus } from './useNotificationStatus';
import { useMemo } from 'react';
import type { AggregatedActivityResponse, Feed } from '@self';

export const useIsAggregatedActivityRead = ({
  feed: feedFromProps,
  aggregatedActivity,
}: {
  feed?: Feed;
  aggregatedActivity: AggregatedActivityResponse;
}) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const { read_activities: readActivities, last_read_at: lastReadAt } =
    useNotificationStatus(feed) ?? {};

  const group = aggregatedActivity.group;

  return useMemo(
    () =>
      (lastReadAt &&
        aggregatedActivity.updated_at.getTime() <= lastReadAt.getTime()) ||
      (readActivities ?? []).includes(group),
    [lastReadAt, aggregatedActivity.updated_at, readActivities, group],
  );
};
