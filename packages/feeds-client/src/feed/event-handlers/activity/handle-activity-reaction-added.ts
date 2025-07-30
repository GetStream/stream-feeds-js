import type { Feed } from '../../../feed';
import type {
  ActivityReactionAddedEvent,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateActivityInState } from './handle-activity-updated';

export const addReactionToActivity = (
  event: ActivityReactionAddedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_reactions if the reaction is from the current user
  const ownReactions = [...(activity.own_reactions || [])];
  if (isCurrentUser) {
    ownReactions.push(event.reaction);
  }

  return {
    ...activity,
    own_reactions: ownReactions,
    latest_reactions: event.activity.latest_reactions,
    reaction_groups: event.activity.reaction_groups,
    changed: true,
  };
};

export const addReactionToActivities = (
  event: ActivityReactionAddedEvent,
  activities: ActivityResponse[] | undefined,
  isCurrentUser: boolean,
): UpdateStateResult<{ activities: ActivityResponse[] }> => {
  if (!activities) {
    return { changed: false, activities: [] };
  }

  const activityIndex = activities.findIndex((a) => a.id === event.activity.id);
  if (activityIndex === -1) {
    return { changed: false, activities };
  }

  const activity = activities[activityIndex];
  const updatedActivity = addReactionToActivity(event, activity, isCurrentUser);
  return updateActivityInState(updatedActivity, activities, true);
};

export function handleActivityReactionAdded(
  this: Feed,
  event: EventPayload<'feeds.activity.reaction.added'>,
) {
  const currentActivities = this.currentState.activities;
  const connectedUser = this.client.state.getLatestValue().connected_user;
  const isCurrentUser = Boolean(
    connectedUser && event.reaction.user.id === connectedUser.id,
  );

  const result = addReactionToActivities(
    event,
    currentActivities,
    isCurrentUser,
  );
  if (result.changed) {
    this.state.partialNext({ activities: result.activities });
  }
}
