import { ActivityResponse } from '../gen/models';
import { UpdateStateResult } from '../types-internal';

export const addActivitiesToState = (
  newActivities: ActivityResponse[],
  activities: ActivityResponse[] | undefined,
  position: 'start' | 'end',
) => {
  let result: UpdateStateResult<{ activities: ActivityResponse[] }>;
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

  const newActivitiesDeduplicated: ActivityResponse[] = [];
  newActivities.forEach((newActivityResponse) => {
    const index = activities.findIndex((a) => a.id === newActivityResponse.id);
    if (index === -1) {
      newActivitiesDeduplicated.push(newActivityResponse);
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
  updatedActivityResponse: ActivityResponse,
  activities: ActivityResponse[],
) => {
  const index = activities.findIndex(
    (a) => a.id === updatedActivityResponse.id,
  );
  if (index !== -1) {
    const newActivities = [...activities];
    const activity = activities[index];
    newActivities[index] = {
      ...updatedActivityResponse,
      own_reactions: activity.own_reactions,
      own_bookmarks: activity.own_bookmarks,
      latest_reactions: activity.latest_reactions,
      reaction_groups: activity.reaction_groups,
    };
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};

export const removeActivityFromState = (
  activityResponse: ActivityResponse,
  activities: ActivityResponse[],
) => {
  const index = activities.findIndex((a) => a.id === activityResponse.id);
  if (index !== -1) {
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};
