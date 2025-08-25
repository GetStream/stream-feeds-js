import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useNotificationStatus } from './useNotificationStatus';
import { useMemo } from 'react';
import { AggregatedActivityResponse } from '../../../src/gen/models';
import { Feed } from '../../../src/feed';

export const useIsAggregatedActivityRead = ({
  feed: feedFromProps,
  aggregatedActivity,
}: {
  feed?: Feed;
  aggregatedActivity: AggregatedActivityResponse;
}) => {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const { read_activities: readActivities, /* last_read_at: lastReadAt */ } =
    useNotificationStatus(feed) ?? {};

  const group = aggregatedActivity.group;

  return useMemo(
    () =>
      // FIXME: This part of the condition does not work as marking individual groups as read also updates the last_read_at. Should be uncommented once it's fixed on the backend.
      // (lastReadAt &&
      //   aggregatedActivity.updated_at.getTime() <= lastReadAt.getTime()) ||
      (readActivities ?? []).includes(group),
    [readActivities, group],
  );
};
