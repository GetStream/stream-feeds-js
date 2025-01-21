import {
  Activity,
  ActivityReactionNewEvent,
  ActivityReactionUpdatedEvent,
  Reaction,
} from './gen/models';

export const addReactionToActivity = (
  activities: Activity[],
  event: ActivityReactionNewEvent,
  isOwnReaction: boolean,
) => {
  return updateActivity(
    activities,
    event.activity,
    event.reaction,
    isOwnReaction,
    'create',
  );
};

export const updateReactionOfActivity = (
  activities: Activity[],
  event: ActivityReactionUpdatedEvent,
  isOwnReaction: boolean,
) => {
  return updateActivity(
    activities,
    event.activity,
    event.reaction,
    isOwnReaction,
    'edit',
  );
};

export const deleteReactionFromActivity = (
  activities: Activity[],
  event: ActivityReactionUpdatedEvent,
  isOwnReaction: boolean,
) => {
  return updateActivity(
    activities,
    event.activity,
    event.reaction,
    isOwnReaction,
    'delete',
  );
};

const updateActivity = (
  activities: Activity[],
  activity: Activity,
  reaction: Reaction,
  isOwnReaction: boolean,
  operation: 'create' | 'edit' | 'delete',
) => {
  const activityIndex = activities.findIndex((a) => a.id === activity.id);
  if (activityIndex !== -1) {
    const oldActivity = activities[activityIndex];
    const updatedActivites = [...activities];
    updatedActivites[activityIndex] = activity;
    activity.own_reactions = [...oldActivity.own_reactions];
    if (isOwnReaction) {
      const existingReactionIndex = activity.own_reactions.findIndex(
        (r) => r.type === reaction.type,
      );
      switch (operation) {
        case 'create':
          activity.own_reactions.push(reaction);
          break;
        case 'edit':
          if (existingReactionIndex !== -1) {
            activity.own_reactions[existingReactionIndex] = reaction;
          } else {
            // We can assume enforce_unique at this point
            activity.own_reactions = [reaction];
          }
          break;
        case 'delete':
          if (existingReactionIndex !== -1) {
            activity.own_reactions.splice(existingReactionIndex, 1);
          }
      }
    }

    return {
      changed: true,
      activities: updatedActivites,
    };
  } else {
    return { changed: false, activities };
  }
};
