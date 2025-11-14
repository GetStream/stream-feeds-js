import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import {
  getStateUpdateQueueId,
  shouldUpdateState,
  updateEntityInArray,
} from '../../../utils';
import { eventTriggeredByConnectedUser } from '../../../utils/event-triggered-by-connected-user';
import { updateActivity } from '../activity-updater';

export type ActivityUpdatedPayload = PartializeAllBut<
  EventPayload<'feeds.activity.updated'>,
  'activity'
>;

const sharedUpdateActivity = updateActivity;

export const updateActivityInState = (
  event: ActivityUpdatedPayload,
  activities: ActivityResponse[] | undefined,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) => activity.id === event.activity.id,
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        currentActivity: matchedActivity,
        newActivtiy: event.activity,
      }),
  });

export const updatePinnedActivityInState = (
  event: ActivityUpdatedPayload,
  pinnedActivities: ActivityPinResponse[] | undefined,
) =>
  updateEntityInArray({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.activity.id,
    updater: (matchedPinnedActivity) => {
      const newActivity = sharedUpdateActivity({
        currentActivity: matchedPinnedActivity.activity,
        newActivtiy: event.activity,
      });

      if (newActivity === matchedPinnedActivity.activity) {
        return matchedPinnedActivity;
      }

      return {
        ...matchedPinnedActivity,
        activity: newActivity,
      };
    },
  });

export function handleActivityUpdated(
  this: Feed,
  payload: ActivityUpdatedPayload,
  fromWs?: boolean,
) {
  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(payload, 'activity-updated'),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
      isTriggeredByConnectedUser: eventTriggeredByConnectedUser.call(
        this,
        payload,
      ),
    })
  ) {
    return;
  }
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;

  const currentActivity = currentActivities?.find(
    (a) => a.id === payload.activity.id,
  );
  if (
    !payload.activity.current_feed &&
    payload.activity.feeds.length === 1 &&
    currentActivity?.current_feed
  ) {
    payload.activity.current_feed = currentActivity.current_feed;
  }

  const [result1, result2] = [
    this.hasActivity(payload.activity.id)
      ? updateActivityInState(payload, currentActivities)
      : undefined,
    updatePinnedActivityInState(payload, currentPinnedActivities),
  ];

  if (result1?.changed || result2.changed) {
    this.client.hydratePollCache([payload.activity]);

    if (payload.activity.current_feed) {
      this.client.hydrateCapabilitiesCache([payload.activity.current_feed]);
    }

    this.state.partialNext({
      activities: result1?.changed ? result1.entities : currentActivities,
      pinned_activities: result2.entities,
    });
  }
}
