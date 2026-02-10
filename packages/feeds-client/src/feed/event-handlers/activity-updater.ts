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
    friend_reactions: currentActivity.friend_reactions,
    friend_reaction_count: currentActivity.friend_reaction_count,
  };
};
