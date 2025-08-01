import type { Feed } from '../../../feed';
import type {
  ActivityReactionAddedEvent,
  ActivityResponse,
  FeedsReactionResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateActivityInState } from './handle-activity-updated';

export const addReactionToActivity = (
  event: ActivityReactionAddedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_reactions if the reaction is from the
  let newOwnReactions: FeedsReactionResponse[] | undefined;

  if (isCurrentUser) {
    newOwnReactions = [...(activity.own_reactions || []), event.reaction];
  }

  return {
    ...activity,
    own_reactions: newOwnReactions ?? activity.own_reactions,
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
  return updateActivityInState({ updatedActivity, activities });
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
  
  // TODO: handle pinned activities

  const result = addReactionToActivities(
    event,
    currentActivities,
    isCurrentUser,
  );
  if (result.changed) {
    this.state.partialNext({ activities: result.activities });
  }
}
