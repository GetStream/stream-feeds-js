import { Activity, Reaction } from './gen/models';

export const addReactionToActivity = (
  activities: Activity[],
  reaction: Reaction,
) => {
  const activity = activities.find((a) => a.id === reaction.entity_id);
  if (!activity) {
    return {
      changed: false,
      activities,
    };
  }
};

export const updateReactionForActivity = (
  activity: Activity,
  reaction: Reaction,
) => {};
