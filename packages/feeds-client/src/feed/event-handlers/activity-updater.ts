import type { ActivityResponse } from '../../gen/models';

export const updateActivity = ({
  currentActivity,
  newActivtiy,
}: {
  currentActivity: ActivityResponse;
  newActivtiy: ActivityResponse;
}) => {
  if (
    !newActivtiy.current_feed &&
    newActivtiy.feeds.length === 1 &&
    currentActivity.current_feed
  ) {
    newActivtiy.current_feed = currentActivity.current_feed;
  }

  return {
    ...newActivtiy,
    own_reactions: currentActivity.own_reactions,
    own_bookmarks: currentActivity.own_bookmarks,
  };
};
