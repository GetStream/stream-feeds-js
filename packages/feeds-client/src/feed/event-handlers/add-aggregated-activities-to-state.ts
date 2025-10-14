import type { AggregatedActivityResponse } from '../../gen/models';
import type { UpdateStateResult } from '../../types-internal';
import { replaceUniqueArrayMerge, uniqueArrayMerge } from '../../utils';
import { updateActivity } from './activity-updater';

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
      aggregated_activities: aggregatedActivities ?? [],
    };
  } else {
    result = {
      changed: true,
      aggregated_activities: [],
    };

    // Merge update activities in the group
    newAggregatedActivities.forEach((newAggregatedActivity) => {
      const existingAggregatedActivity = aggregatedActivities?.find(
        (a) => a.group === newAggregatedActivity.group,
      );
      if (existingAggregatedActivity) {
        for (let i = 0; i < newAggregatedActivity.activities.length; i++) {
          const activity = newAggregatedActivity.activities[i];
          const existingActivity = existingAggregatedActivity.activities.find(
            (a) => a.id === activity.id,
          );
          if (existingActivity) {
            newAggregatedActivity.activities[i] = updateActivity({
              currentActivity: existingActivity,
              newActivtiy: activity,
            });
          }
        }
      }
    });

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
  }

  return result;
};
