import { Feed } from '../../../feed';
import { ActivityPinResponse, ActivityResponse } from '../../../gen/models';
import { EventPayload, PartializeAllBut } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';

type ActivityUpdatedPayload = PartializeAllBut<
  EventPayload<'feeds.activity.updated'>,
  'activity'
>;

const sharedUpdateActivity = ({
  currentActivity,
  event,
}: {
  currentActivity: ActivityResponse;
  event: ActivityUpdatedPayload;
}) => {
  return {
    ...event.activity,
    own_reactions: currentActivity.own_reactions,
    own_bookmarks: currentActivity.own_bookmarks,
  };
};

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
        event,
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
        event,
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
  event: ActivityUpdatedPayload,
) {
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;

  const [result1, result2] = [
    updateActivityInState(event, currentActivities),
    updatePinnedActivityInState(event, currentPinnedActivities),
  ];

  if (result1.changed || result2.changed) {
    this.client.hydratePollCache([event.activity]);

    this.state.partialNext({
      activities: result1.entities,
      pinned_activities: result2.entities,
    });
  }
}
