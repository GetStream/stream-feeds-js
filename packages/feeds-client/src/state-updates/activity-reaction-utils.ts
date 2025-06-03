import { ActivityResponse, FeedsReactionResponse } from '../gen/models';
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
  reaction: FeedsReactionResponse,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_reactions if the reaction is from the current user
  const ownReactions = [...(activity.own_reactions || [])];
  if (isCurrentUser) {
    ownReactions.push(reaction);
  }

  // Update latest_reactions
  const latestReactions = [...(activity.latest_reactions || [])];
  latestReactions.push(reaction);

  // Update reaction_groups
  const reactionGroups = { ...activity.reaction_groups };
  const reactionType = reaction.type;
  if (!reactionGroups[reactionType]) {
    reactionGroups[reactionType] = {
      count: 1,
      first_reaction_at: reaction.created_at,
      last_reaction_at: reaction.created_at,
    };
  } else {
    reactionGroups[reactionType] = {
      ...reactionGroups[reactionType],
      count: (reactionGroups[reactionType].count || 0) + 1,
      last_reaction_at: reaction.created_at,
    };
  }

  return {
    ...activity,
    own_reactions: ownReactions,
    latest_reactions: latestReactions,
    reaction_groups: reactionGroups,
    changed: true,
  };
};

export const removeReactionFromActivity = (
  reaction: FeedsReactionResponse,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_reactions if the reaction is from the current user
  const ownReactions = isCurrentUser
    ? (activity.own_reactions || []).filter(
        (r) => !(r.type === reaction.type && r.user.id === reaction.user.id),
      )
    : activity.own_reactions;

  // Update latest_reactions
  const latestReactions = (activity.latest_reactions || []).filter(
    (r) => !(r.type === reaction.type && r.user.id === reaction.user.id),
  );

  // Update reaction_groups
  const reactionGroups = { ...activity.reaction_groups };
  const reactionType = reaction.type;
  if (reactionGroups[reactionType]) {
    const newCount = (reactionGroups[reactionType].count || 1) - 1;
    if (newCount <= 0) {
      delete reactionGroups[reactionType];
    } else {
      reactionGroups[reactionType] = {
        ...reactionGroups[reactionType],
        count: newCount,
      };
    }
  }

  return {
    ...activity,
    own_reactions: ownReactions,
    latest_reactions: latestReactions,
    reaction_groups: reactionGroups,
    changed: true,
  };
};

export const addReactionToActivities = (
  reaction: FeedsReactionResponse,
  activities: ActivityResponse[] | undefined,
  isCurrentUser: boolean,
): UpdateStateResult<{ activities: ActivityResponse[] }> => {
  if (!activities) {
    return { changed: false, activities: [] };
  }

  const activityIndex = activities.findIndex(
    (a) => a.id === reaction.activity_id,
  );
  if (activityIndex === -1) {
    return { changed: false, activities };
  }

  const activity = activities[activityIndex];
  const updatedActivity = addReactionToActivity(
    reaction,
    activity,
    isCurrentUser,
  );
  return updateActivityInActivities(updatedActivity, activities);
};

export const removeReactionFromActivities = (
  reaction: FeedsReactionResponse,
  activities: ActivityResponse[] | undefined,
  isCurrentUser: boolean,
): UpdateStateResult<{ activities: ActivityResponse[] }> => {
  if (!activities) {
    return { changed: false, activities: [] };
  }

  const activityIndex = activities.findIndex(
    (a) => a.id === reaction.activity_id,
  );
  if (activityIndex === -1) {
    return { changed: false, activities };
  }

  const activity = activities[activityIndex];
  const updatedActivity = removeReactionFromActivity(
    reaction,
    activity,
    isCurrentUser,
  );
  return updateActivityInActivities(updatedActivity, activities);
};
