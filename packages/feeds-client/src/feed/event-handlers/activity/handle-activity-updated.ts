import { Feed } from '../../../feed';
import { ActivityResponse } from '../../../gen/models';
import { EventPayload } from '../../../types-internal';

export const updateActivityInState = (
  updatedActivityResponse: ActivityResponse,
  activities: ActivityResponse[],
  replaceCompletely: boolean = false,
) => {
  const index = activities.findIndex(
    (a) => a.id === updatedActivityResponse.id,
  );
  if (index !== -1) {
    const newActivities = [...activities];
    const activity = activities[index];

    if (replaceCompletely) {
      newActivities[index] = updatedActivityResponse;
    } else {
      newActivities[index] = {
        ...updatedActivityResponse,
        own_reactions: activity.own_reactions,
        own_bookmarks: activity.own_bookmarks,
        latest_reactions: activity.latest_reactions,
        reaction_groups: activity.reaction_groups,
      };
    }

    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};

export function handleActivityUpdated(
  this: Feed,
  event: EventPayload<'feeds.activity.updated'>,
) {
  const currentActivities = this.currentState.activities;
  if (currentActivities) {
    const result = updateActivityInState(event.activity, currentActivities);
    if (result.changed) {
      this.client.hydratePollCache([event.activity]);
      this.state.partialNext({ activities: result.activities });
    }
  }
}
