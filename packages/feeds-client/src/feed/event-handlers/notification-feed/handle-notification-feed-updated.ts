import type { Feed } from '../../../feed';
import type {
  AggregatedActivityResponse,
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';
import { uniqueArrayMerge } from '../../../utils';

export const addAggregatedActivitiesToState = (
  newAggregatedActivities: AggregatedActivityResponse[],
  aggregatedActivities: AggregatedActivityResponse[] | undefined,
  position: 'start' | 'end',
) => {
  let result: UpdateStateResult<{
    aggregated_activities: AggregatedActivityResponse[];
  }>;
  if (newAggregatedActivities.length === 0) {
    result = {
      changed: false,
      aggregated_activities: [],
    };
  } else {
    result = {
      changed: true,
      aggregated_activities: [],
    };
  }

  result.aggregated_activities =
    position === 'start'
      ? uniqueArrayMerge(
          newAggregatedActivities,
          aggregatedActivities ?? [],
          (a) => a.group,
        )
      : uniqueArrayMerge(
          aggregatedActivities ?? [],
          newAggregatedActivities,
          (a) => a.group,
        );

  return result;
};

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

  if (event.notification_status && currentNotificationStatus) {
    const notificationStatusResult = updateNotificationStatus(
      event.notification_status,
      currentNotificationStatus,
    );

    if (notificationStatusResult.changed) {
      updates.notification_status =
        notificationStatusResult.notification_status;
    }
  }

  if (event.aggregated_activities) {
    const aggregatedActivitiesResult = addAggregatedActivitiesToState(
      event.aggregated_activities,
      currentAggregatedActivities,
      'start', // Add new activities at the start
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
  );
  if (result.changed) {
    this.state.partialNext({
      notification_status: result.data?.notification_status,
      aggregated_activities: result.data?.aggregated_activities,
    });
  }
}
