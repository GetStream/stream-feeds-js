import {
  ActivityReactionAddedEvent,
  ActivityReactionDeletedEvent,
  ActivityResponse,
} from '../gen/models';
import { UpdateStateResult } from '../types-internal';

const updateActivityInActivities = (
  updatedActivity: ActivityResponse,
  activities: ActivityResponse[],
): UpdateStateResult<{ activities: ActivityResponse[] }> => {
  const index = activities.findIndex((a) => a.id === updatedActivity.id);
  if (index !== -1) {
    const newActivities = [...activities];
    newActivities[index] = updatedActivity;
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};

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

export const removeReactionFromActivity = (
  event: ActivityReactionDeletedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_reactions if the reaction is from the current user
  const ownReactions = isCurrentUser
    ? (activity.own_reactions || []).filter(
        (r) =>
          !(
            r.type === event.reaction.type &&
            r.user.id === event.reaction.user.id
          ),
      )
    : activity.own_reactions;

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
  return updateActivityInActivities(updatedActivity, activities);
};

export const removeReactionFromActivities = (
  event: ActivityReactionDeletedEvent,
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
  const updatedActivity = removeReactionFromActivity(
    event,
    activity,
    isCurrentUser,
  );
  return updateActivityInActivities(updatedActivity, activities);
};
