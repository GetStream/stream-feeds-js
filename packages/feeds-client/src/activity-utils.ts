import { Activity } from './gen/models';

export const addActivitiesToState = (
  newActivities: Activity[],
  activities: Activity[],
  position: 'start' | 'end',
) => {
  const newActivitiesDeduplicated: Activity[] = [];
  newActivities.forEach((newActivity) => {
    const index = activities.findIndex((a) => a.id === newActivity.id);
    if (index === -1) {
      newActivitiesDeduplicated.push(newActivity);
    }
  });
  if (newActivitiesDeduplicated.length === 0) {
    return { changed: false, activities };
  } else {
    const updatedActivities = [
      ...(position === 'start' ? newActivitiesDeduplicated : []),
      ...activities,
      ...(position === 'end' ? newActivitiesDeduplicated : []),
    ];
    return { changed: true, activities: updatedActivities };
  }
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
