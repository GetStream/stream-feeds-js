import type { Feed } from '../..';
import type {
  ActivityResponse,
  AggregatedActivityResponse,
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';
import { addAggregatedActivitiesToState } from '../add-aggregated-activities-to-state';

export const updateNotificationStatus = (
  newNotificationStatus?: NotificationStatusResponse,
  currentNotificationStatus?: NotificationStatusResponse,
) => {
  if (!newNotificationStatus && !currentNotificationStatus) {
    return {
      changed: false,
      notification_status: undefined,
    };
  } else if (!newNotificationStatus) {
    return {
      changed: false,
      notification_status: currentNotificationStatus,
    };
  } else {
    return {
      changed: true,
      notification_status: {
        ...newNotificationStatus,
      },
    };
  }
};

export const updateNotificationFeedFromEvent = (
  event: NotificationFeedUpdatedEvent,
  currentAggregatedActivities?: AggregatedActivityResponse[],
  currentNotificationStatus?: NotificationStatusResponse,
  currentActivities?: ActivityResponse[],
): UpdateStateResult<{
  data?: {
    notification_status?: NotificationStatusResponse;
    aggregated_activities?: AggregatedActivityResponse[];
    activities?: ActivityResponse[];
  };
}> => {
  const updates: {
    notification_status?: NotificationStatusResponse;
    aggregated_activities?: AggregatedActivityResponse[];
    activities?: ActivityResponse[];
  } = {};

  if (event.notification_status) {
    const notificationStatusResult = updateNotificationStatus(
      event.notification_status,
      currentNotificationStatus,
    );

    if (notificationStatusResult.changed) {
      updates.notification_status =
        notificationStatusResult.notification_status;
    }
  }

  // Determine effective notification status (prefer new from event, fall back to current)
  const effectiveStatus =
    event.notification_status ?? currentNotificationStatus;
  const lastReadAt = effectiveStatus?.last_read_at;
  const lastSeenAt = effectiveStatus?.last_seen_at;
  const readActivities = effectiveStatus?.read_activities ?? [];
  const seenActivities = effectiveStatus?.seen_activities ?? [];

  // For flat feeds — update currentActivities with is_read/is_seen
  if (currentActivities?.length && effectiveStatus) {
    let anyChanged = false;
    const updatedActivities = currentActivities.map((activity) => {
      const isRead =
        (lastReadAt != null &&
          activity.updated_at.getTime() < lastReadAt.getTime()) ||
        readActivities.includes(activity.id);
      const isSeen =
        (lastSeenAt != null &&
          activity.updated_at.getTime() < lastSeenAt.getTime()) ||
        seenActivities.includes(activity.id);
      if (activity.is_read !== isRead || activity.is_seen !== isSeen) {
        anyChanged = true;
        return { ...activity, is_read: isRead, is_seen: isSeen };
      }
      return activity;
    });
    if (anyChanged) {
      updates.activities = updatedActivities;
    }
  }

  // For aggregated feeds — update aggregated_activities with is_read/is_seen
  if (currentAggregatedActivities?.length && effectiveStatus) {
    const baseAggregated = currentAggregatedActivities;
    let anyChanged = false;
    const updatedAggregated = baseAggregated.map((group) => {
      const isRead =
        (lastReadAt != null &&
          group.updated_at.getTime() < lastReadAt.getTime()) ||
        readActivities.includes(group.group);
      const isSeen =
        (lastSeenAt != null &&
          group.updated_at.getTime() < lastSeenAt.getTime()) ||
        seenActivities.includes(group.group);
      if (group.is_read !== isRead || group.is_seen !== isSeen) {
        anyChanged = true;
        return { ...group, is_read: isRead, is_seen: isSeen };
      }
      return group;
    });
    if (anyChanged) {
      updates.aggregated_activities = updatedAggregated;
    }
  }

  // Leave this to the end, because notification_status may not be 100% accurate (only includes last 100 activities)
  if (event.aggregated_activities && currentAggregatedActivities) {
    const aggregatedActivitiesResult = addAggregatedActivitiesToState(
      event.aggregated_activities,
      updates.aggregated_activities ?? currentAggregatedActivities,
      'replace-then-start',
    );

    if (aggregatedActivitiesResult.changed) {
      updates.aggregated_activities =
        aggregatedActivitiesResult.aggregated_activities;
    }
  }

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
  const result = updateNotificationFeedFromEvent(
    event,
    this.currentState.aggregated_activities,
    this.currentState.notification_status,
    this.currentState.activities,
  );
  if (result.changed) {
    this.state.partialNext({
      notification_status: result.data?.notification_status,
      aggregated_activities:
        result.data?.aggregated_activities ??
        this.currentState.aggregated_activities,
      activities: result.data?.activities ?? this.currentState.activities,
    });
  }
}
