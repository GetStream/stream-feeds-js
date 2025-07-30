import {
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
  AggregatedActivityResponse,
} from '../gen/models';
import { UpdateStateResult } from '../types-internal';

export const updateNotificationFeedFromEvent = (
  event: NotificationFeedUpdatedEvent,
): UpdateStateResult<{
  data?: {
    notification_status?: NotificationStatusResponse;
    aggregated_activities?: AggregatedActivityResponse[];
  };
}> => {
  const updates: {
    notification_status?: NotificationStatusResponse;
    aggregated_activities?: AggregatedActivityResponse[];
  } = {};

  if (event.notification_status) {
    updates.notification_status = event.notification_status;
  }

  if (event.aggregated_activities) {
    updates.aggregated_activities = event.aggregated_activities;
  }

  // Only return changed if we have actual updates
  if (Object.keys(updates).length > 0) {
    return {
      changed: true,
      data: updates,
    };
  }

  return {
    changed: false,
  };
};
