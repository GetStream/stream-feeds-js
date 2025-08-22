import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

export const removeActivityFromState = (
  activityResponse: ActivityResponse,
  activities: ActivityResponse[] | undefined,
): UpdateStateResult<{
  activities: ActivityResponse[] | undefined;
}> => {
  const index =
    activities?.findIndex((activity) => activity.id === activityResponse.id) ??
    -1;

  if (index !== -1) {
    const newActivities = [...activities!];
    newActivities.splice(index, 1);
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};

export const removePinnedActivityFromState = (
  activityResponse: ActivityResponse,
  pinnedActivities: ActivityPinResponse[] | undefined,
): UpdateStateResult<{
  pinned_activities: ActivityPinResponse[] | undefined;
}> => {
  const index =
    pinnedActivities?.findIndex(
      (pinnedActivity) => pinnedActivity.activity.id === activityResponse.id,
    ) ?? -1;

  if (index !== -1) {
    const newActivities = [...pinnedActivities!];
    newActivities.splice(index, 1);
    return { changed: true, pinned_activities: newActivities };
  } else {
    return { changed: false, pinned_activities: pinnedActivities };
  }
};

export function handleActivityDeleted(
  this: Feed,
  event: EventPayload<'feeds.activity.deleted'>,
) {
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;

  const [result1, result2] = [
    removeActivityFromState(event.activity, currentActivities),
    removePinnedActivityFromState(event.activity, currentPinnedActivities),
  ];

  if (result1.changed || result2.changed) {
    this.state.partialNext({
      activities: result1.activities,
      pinned_activities: result2.pinned_activities,
    });
  }
}
