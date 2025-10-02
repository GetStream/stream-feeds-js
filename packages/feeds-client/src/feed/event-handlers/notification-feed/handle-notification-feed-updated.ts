import type { Feed } from '../../../feed';
import type {
  AggregatedActivityResponse,
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
  StoriesFeedUpdatedEvent,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

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

export function handleNotificationFeedUpdated(
  this: Feed,
  event: EventPayload<'feeds.notification_feed.updated'>,
) {
  const result = updateNotificationFeedFromEvent(event);
  if (result.changed) {
    this.state.partialNext({
      notification_status: result.data?.notification_status,
      aggregated_activities: result.data?.aggregated_activities,
    });
  }
}

export const updateStoriesFeedFromEvent = (
  event: StoriesFeedUpdatedEvent,
): UpdateStateResult<{
  data?: {
    aggregated_activities?: AggregatedActivityResponse[];
  };
}> => {
  const updates: {
    aggregated_activities?: AggregatedActivityResponse[];
  } = {};

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

export function handleStoriesFeedUpdated(
  this: Feed,
  event: EventPayload<'feeds.stories_feed.updated'>,
) {
  const result = updateStoriesFeedFromEvent(event);
  if (result.changed) {
    this.state.partialNext({
      aggregated_activities: result.data?.aggregated_activities,
    });
  }
}
