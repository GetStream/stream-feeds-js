import { ActivityMarkEvent, NotificationStatusResponse } from '../gen/models';
import { UpdateStateResult } from '../types-internal';

export const updateNotificationStatusFromActivityMarked = (
  event: ActivityMarkEvent,
  currentNotificationStatus: NotificationStatusResponse | undefined,
  aggregatedActivities: Array<{ group: string }> = [],
): UpdateStateResult<{
  data?: { notification_status: NotificationStatusResponse };
}> => {
  if (!currentNotificationStatus) {
    return {
      changed: false,
    };
  }

  const newState = {
    ...currentNotificationStatus,
  };

  if (event.mark_all_read) {
    const allGroupIds = aggregatedActivities.map((activity) => activity.group);
    newState.read_activities = [
      ...new Set([
        ...(currentNotificationStatus.read_activities ?? []),
        ...allGroupIds,
      ]),
    ];
  }

  if (event.mark_read && event.mark_read.length > 0) {
    newState.read_activities = [
      ...new Set([
        ...(currentNotificationStatus?.read_activities ?? []),
        ...event.mark_read,
      ]),
    ];
  }

  if (event.mark_all_seen) {
    newState.last_seen_at = new Date();
  }

  return {
    changed: true,
    data: { notification_status: newState },
  };
};
