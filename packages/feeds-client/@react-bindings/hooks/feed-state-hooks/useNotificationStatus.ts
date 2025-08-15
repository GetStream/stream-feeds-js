import { Feed, FeedState } from '../../../src/feed';
import { useStateStore } from '../useStateStore';
import { NotificationStatusResponse } from '../../../src/gen/models';

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
export function useNotificationStatus(feed?: Feed) {
  return useStateStore(feed?.state, selector);

  // TODO: add markRead and markAllRead functions?
  // return useMemo(() => {
  //   if (!data) {
  //     return undefined;
  //   }

  //   return data;
  // }, [data]);
}
