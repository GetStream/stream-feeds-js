import type { Feed } from '../../../feed';
import type {
  AggregatedActivityResponse,
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

export const addAggregatedActivitiesToState = (
  newAggregatedActivities: AggregatedActivityResponse[],
  aggregatedActivities: AggregatedActivityResponse[] | undefined,
  position: 'start' | 'end',
) => {
  let result: UpdateStateResult<{
    aggregated_activities: AggregatedActivityResponse[];
  }>;
  if (aggregatedActivities === undefined) {
    aggregatedActivities = [];
    result = {
      changed: false,
      aggregated_activities: aggregatedActivities,
    };
  } else {
    result = {
      changed: false,
      aggregated_activities: aggregatedActivities,
    };
  }

  let hasChanges = false;
  const updatedAggregatedActivities = [...result.aggregated_activities];
  const newActivitiesToAdd: AggregatedActivityResponse[] = [];

  // First pass: handle existing activities (updates) and collect new activities
  newAggregatedActivities.forEach((newAggregatedActivityResponse) => {
    const existingIndex = updatedAggregatedActivities.findIndex(
      (a) => a.group === newAggregatedActivityResponse.group,
    );

    if (existingIndex === -1) {
      // Activity doesn't exist, collect it for later addition
      newActivitiesToAdd.push(newAggregatedActivityResponse);
    } else {
      // Activity exists, update it (upsert)
      const existingActivity = updatedAggregatedActivities[existingIndex];

      const hasActivityChanged =
        existingActivity.activity_count !==
          newAggregatedActivityResponse.activity_count ||
        existingActivity.score !== newAggregatedActivityResponse.score ||
        existingActivity.user_count !==
          newAggregatedActivityResponse.user_count ||
        existingActivity.user_count_truncated !==
          newAggregatedActivityResponse.user_count_truncated ||
        existingActivity.updated_at.getTime() !==
          newAggregatedActivityResponse.updated_at.getTime() ||
        existingActivity.activities.length !==
          newAggregatedActivityResponse.activities.length;

      if (hasActivityChanged) {
        updatedAggregatedActivities[existingIndex] =
          newAggregatedActivityResponse;
        hasChanges = true;
      }
    }
  });

  if (newActivitiesToAdd.length > 0) {
    if (position === 'start') {
      updatedAggregatedActivities.unshift(...newActivitiesToAdd);
    } else {
      updatedAggregatedActivities.push(...newActivitiesToAdd);
    }
    hasChanges = true;
  }

  if (hasChanges) {
    result = {
      changed: true,
      aggregated_activities: updatedAggregatedActivities,
    };
  }

  return result;
};

export const updateNotificationFeedFromEvent = (
  event: NotificationFeedUpdatedEvent,
  currentAggregatedActivities?: AggregatedActivityResponse[],
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
