import type { ActivityResponse } from '../../gen/models';

export const updateActivity = ({
  currentActivity,
  newActivtiy,
}: {
  currentActivity: ActivityResponse;
  newActivtiy: ActivityResponse;
}) => {
  return {
    ...newActivtiy,
    own_reactions: currentActivity.own_reactions,
    own_bookmarks: currentActivity.own_bookmarks,
  };
};
