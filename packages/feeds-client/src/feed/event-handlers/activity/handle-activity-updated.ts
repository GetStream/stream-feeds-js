import { Feed, FeedState } from '../../../feed';
import { ActivityPinResponse, ActivityResponse } from '../../../gen/models';
import { EventPayload } from '../../../types-internal';

export const updateActivityInState = ({
  updatedActivity,
  activities,
  /**
   * If true, the function will merge the updated activity with the existing one
   * in the state, preserving properties like own_reactions and own_bookmarks.
   */
  preserveOwnProperties = false,
}: {
  updatedActivity: ActivityResponse;
  activities: ActivityResponse[];
  preserveOwnProperties?: boolean;
}) => {
  const activityIndex = activities.findIndex(
    (activity) => activity.id === updatedActivity.id,
  );

  if (activityIndex !== -1) {
    const newActivities = [...activities];

    const currentActivity = newActivities[activityIndex];

    if (preserveOwnProperties) {
      newActivities[activityIndex] = {
        ...updatedActivity,
        own_reactions: currentActivity.own_reactions,
        own_bookmarks: currentActivity.own_bookmarks,
      };
    } else {
      newActivities[activityIndex] = updatedActivity;
    }

    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};

export const updatePinnedActivityInState = (
  updatedActivityResponse: ActivityResponse,
  pinnedActivities: ActivityPinResponse[] | undefined,
) => {
  const index =
    pinnedActivities?.findIndex(
      (pinnedActivity) =>
        pinnedActivity.activity.id === updatedActivityResponse.id,
    ) ?? -1;

  if (index >= 0) {
    const newPinnedActivities = [...pinnedActivities!];

    newPinnedActivities[index] = {
      ...newPinnedActivities[index],
      activity: updatedActivityResponse,
    };

    return { changed: true, pinnedActivities: newPinnedActivities };
  }

  return { changed: false, pinnedActivities };
};

export function handleActivityUpdated(
  this: Feed,
  event: EventPayload<'feeds.activity.updated'>,
) {
  this.client.hydratePollCache([event.activity]);

  this.state.next((currentState) => {
    const {
      activities: currentActivities,
      pinned_activities: currentPinnedActivities,
    } = currentState;

    let newState: FeedState | undefined;

    if (currentActivities) {
      const result = updateActivityInState({
        updatedActivity: event.activity,
        activities: currentActivities,
        preserveOwnProperties: true,
      });

      if (result.changed) {
        newState ??= {
          ...currentState,
        };
        newState.activities = result.activities;
      }
    }

    if (currentPinnedActivities) {
      const result = updatePinnedActivityInState(
        event.activity,
        currentPinnedActivities,
      );

      if (result.changed) {
        newState ??= {
          ...currentState,
        };
        newState.pinned_activities = result.pinnedActivities;
      }
    }

    return newState ?? currentState;
  });
}
