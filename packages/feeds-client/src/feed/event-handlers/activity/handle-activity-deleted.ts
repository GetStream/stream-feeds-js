import type { Feed } from '../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
} from '../../../gen/models';
import type {
  EventPayload,
  PartializeAllBut,
  UpdateStateResult,
} from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import { eventTriggeredByConnectedUser } from '../../../utils/event-triggered-by-connected-user';

export function removeActivityFromState(
  this: Feed,
  activityResponse: ActivityResponse,
  activities: ActivityResponse[] | undefined,
): UpdateStateResult<{
  activities: ActivityResponse[] | undefined;
}> {
  if (this.hasActivity(activityResponse.id)) {
    const index =
      activities?.findIndex(
        (activity) => activity.id === activityResponse.id,
      ) ?? -1;
    const newActivities = [...activities!];
    newActivities.splice(index, 1);
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
}

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

export type ActivityDeletedPayload = PartializeAllBut<
  EventPayload<'feeds.activity.deleted'>,
  'activity'
>;

export function handleActivityDeleted(
  this: Feed,
  event: ActivityDeletedPayload,
  fromWs?: boolean,
) {
  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(event, 'activity-deleted'),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
      isTriggeredByConnectedUser: eventTriggeredByConnectedUser.call(
        this,
        event,
      ),
    })
  ) {
    return;
  }
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;

  const [result1, result2] = [
    this.hasActivity(event.activity.id)
      ? removeActivityFromState.bind(this)(event.activity, currentActivities)
      : undefined,
    removePinnedActivityFromState(event.activity, currentPinnedActivities),
  ];

  if (result1?.changed || result2.changed) {
    this.state.partialNext({
      activities: result1?.changed ? result1.activities : currentActivities,
      pinned_activities: result2.pinned_activities,
    });
  }
}
