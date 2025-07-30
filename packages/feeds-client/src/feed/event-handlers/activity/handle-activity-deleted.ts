import type { Feed } from '../../../feed';
import type { ActivityResponse } from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';

export const removeActivityFromState = (
  activityResponse: ActivityResponse,
  activities: ActivityResponse[],
) => {
  const index = activities.findIndex((a) => a.id === activityResponse.id);
  if (index !== -1) {
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};

export function handleActivityDeleted(
  this: Feed,
  event: EventPayload<'feeds.activity.deleted'>,
) {
  const currentActivities = this.currentState.activities;
  if (currentActivities) {
    const result = removeActivityFromState(event.activity, currentActivities);
    if (result.changed) {
      this.state.partialNext({ activities: result.activities });
    }
  }
}
