import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useFeedContext } from '../../contexts/StreamFeedContext';
import type { Feed, FeedState } from '../../../../feed';
import type { NotificationStatusResponse } from '../../../../gen/models';

const selector = ({ notification_status }: FeedState) =>
  ({
    unread: notification_status?.unread ?? 0,
    unseen: notification_status?.unseen ?? 0,
    last_read_at: notification_status?.last_read_at,
    last_seen_at: notification_status?.last_seen_at,
    read_activities: notification_status?.read_activities,
    seen_activities: notification_status?.seen_activities,
  }) satisfies NotificationStatusResponse;

type UseNotificationStatusReturnType = ReturnType<typeof selector>;

export function useNotificationStatus(
  feed: Feed,
): UseNotificationStatusReturnType;
export function useNotificationStatus(
  feed?: Feed,
): UseNotificationStatusReturnType | undefined;
export function useNotificationStatus(feedFromProps?: Feed) {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  return useStateStore(feed?.state, selector);
}
