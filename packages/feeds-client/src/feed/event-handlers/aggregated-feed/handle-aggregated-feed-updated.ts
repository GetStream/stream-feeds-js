import type { Feed } from '../..';
import type {
  AggregatedActivityResponse,
  NotificationFeedUpdatedEvent,
  NotificationStatusResponse,
  StoriesFeedUpdatedEvent,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';
import { replaceUniqueArrayMerge, uniqueArrayMerge } from '../../../utils';

export const addAggregatedActivitiesToState = (
  newAggregatedActivities: AggregatedActivityResponse[],
  aggregatedActivities: AggregatedActivityResponse[] | undefined,
  position: 'start' | 'end' | 'replace',
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

  switch (position) {
    case 'start':
      result.aggregated_activities = uniqueArrayMerge(
        newAggregatedActivities,
        aggregatedActivities ?? [],
        (a) => a.group,
      );
      break;
    case 'end':
      result.aggregated_activities = uniqueArrayMerge(
        aggregatedActivities ?? [],
        newAggregatedActivities,
        (a) => a.group,
      );
      break;
    case 'replace':
      result.aggregated_activities = replaceUniqueArrayMerge(
        aggregatedActivities ?? [],
        newAggregatedActivities,
        (a) => a.group,
      );
      break;
  }

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

  if (event.aggregated_activities && currentAggregatedActivities) {
    const aggregatedActivitiesResult = addAggregatedActivitiesToState(
      event.aggregated_activities,
      currentAggregatedActivities,
      'start',
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
  );
  if (result.changed) {
    this.state.partialNext({
      notification_status: result.data?.notification_status,
      aggregated_activities: result.data?.aggregated_activities,
    });
  }
}

export function updateStoriesFeedFromEvent(
  aggregatedActivities: AggregatedActivityResponse[] | undefined,
  event: StoriesFeedUpdatedEvent,
): UpdateStateResult<{
  data?: {
    aggregated_activities?: AggregatedActivityResponse[];
  };
}> {
  if (!aggregatedActivities) {
    return {
      changed: false,
    };
  }

  if (event.aggregated_activities) {
    const result = addAggregatedActivitiesToState(
      event.aggregated_activities,
      aggregatedActivities,
      'replace',
    );

    return result;
  }

  return {
    changed: false,
  };
}

export function handleStoriesFeedUpdated(
  this: Feed,
  event: EventPayload<'feeds.stories_feed.updated'>,
) {
  const result = updateStoriesFeedFromEvent(
    this.currentState.aggregated_activities,
    event,
  );
  if (result.changed) {
    this.state.partialNext({
      aggregated_activities: result.data?.aggregated_activities,
    });
  }
}
