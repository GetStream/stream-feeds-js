import type {
  ActivityResponse,
  AggregatedActivityResponse,
  StoriesFeedUpdatedEvent,
} from '../../../gen/models';
import type { UpdateStateResult, EventPayload } from '../../../types-internal';
import type { Feed } from '../../feed';
import { updateActivity } from '../activity-updater';
import { addAggregatedActivitiesToState } from '../add-aggregated-activities-to-state';

export const updateActivities = (
  activitiesToUpsert: ActivityResponse[],
  currentActivities: ActivityResponse[] | undefined,
) => {
  if (
    !activitiesToUpsert ||
    activitiesToUpsert.length === 0 ||
    !currentActivities
  ) {
    return {
      changed: false,
      activities: currentActivities ?? [],
    };
  }

  const result: ActivityResponse[] = [];
  for (let i = 0; i < currentActivities.length; i++) {
    const activity = currentActivities[i];
    const updatedActivity = activitiesToUpsert.find(
      (a) => a.id === activity.id,
    );
    if (updatedActivity) {
      result.push(
        updateActivity({
          currentActivity: activity,
          newActivtiy: updatedActivity,
        }),
      );
    } else {
      result.push(activity);
    }
  }

  return {
    changed: true,
    activities: result,
  };
};

export function updateStoriesFeedFromEvent(
  aggregatedActivities: AggregatedActivityResponse[] | undefined,
  activities: ActivityResponse[] | undefined,
  event: StoriesFeedUpdatedEvent,
): UpdateStateResult<{
  data?: {
    aggregated_activities?: AggregatedActivityResponse[];
    activities?: ActivityResponse[];
  };
}> {
  if (
    (!aggregatedActivities &&
      event.aggregated_activities &&
      event.aggregated_activities?.length > 0) ||
    (!activities && event.activities && event.activities?.length > 0)
  ) {
    return {
      changed: false,
    };
  }

  const result = {
    changed: true,
    data: {
      aggregated_activities: aggregatedActivities,
      activities: activities,
    },
  };
  if (event.aggregated_activities) {
    const aggregatedActivitiesResult = addAggregatedActivitiesToState(
      event.aggregated_activities,
      aggregatedActivities,
      'replace',
    );

    if (aggregatedActivitiesResult.changed) {
      result.data.aggregated_activities =
        aggregatedActivitiesResult.aggregated_activities;
    }
  }

  if (event.activities) {
    const activitiesResult = updateActivities(event.activities, activities);
    if (activitiesResult.changed) {
      result.data.activities = activitiesResult.activities;
    }
  }

  if (event.aggregated_activities || event.activities) {
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
    this.currentState.activities,
    event,
  );
  if (result.changed) {
    this.state.partialNext({
      aggregated_activities: result.data?.aggregated_activities,
      activities: result.data?.activities,
    });
  }
}
