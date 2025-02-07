import { Activity } from '../gen/models';
import { UpdateStateResult } from '../types-internal';

export const addActivitiesToState = (
  newActivities: Activity[],
  activities: Activity[] | undefined,
  position: 'start' | 'end',
) => {
  let result: UpdateStateResult<{ activities: Activity[] }>;
  if (activities === undefined) {
    activities = [];
    result = {
      changed: true,
      activities,
    };
  } else {
    result = {
      changed: false,
      activities,
    };
  }

  const newActivitiesDeduplicated: Activity[] = [];
  newActivities.forEach((newActivity) => {
    const index = activities.findIndex((a) => a.id === newActivity.id);
    if (index === -1) {
      newActivitiesDeduplicated.push(newActivity);
    }
  });

  if (newActivitiesDeduplicated.length > 0) {
    // TODO: since feed activities are not necessarily ordered by created_at (personalization) we don't order by created_at
    // Maybe we can add a flag to the JS client to support order by created_at
    const updatedActivities = [
      ...(position === 'start' ? newActivitiesDeduplicated : []),
      ...activities,
      ...(position === 'end' ? newActivitiesDeduplicated : []),
    ];
    result = { changed: true, activities: updatedActivities };
  }

  return result;
};

export const updateActivityInState = (
  updatedActivity: Activity,
  activities: Activity[],
) => {
  const index = activities.findIndex((a) => a.id === updatedActivity.id);
  if (index !== -1) {
    const newActivities = [...activities];
    const activitiy = activities[index];
    newActivities[index] = {
      ...updatedActivity,
      own_reactions: activitiy.own_reactions,
      latest_reactions: activitiy.latest_reactions,
      reaction_groups: activitiy.reaction_groups,
    };
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};

export const removeActivityFromState = (
  activity: Activity,
  activities: Activity[],
) => {
  const index = activities.findIndex((a) => a.id === activity.id);
  if (index !== -1) {
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};
