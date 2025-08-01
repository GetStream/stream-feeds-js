import type { Feed } from '../../../feed';
import type { ActivityResponse, BookmarkAddedEvent } from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateActivityInState } from '../activity';

export const addBookmarkToActivity = (
  event: BookmarkAddedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_bookmarks if the bookmark is from the current user
  const ownBookmarks = [...(activity.own_bookmarks || [])];
  if (isCurrentUser) {
    ownBookmarks.push(event.bookmark);
  }

  return {
    ...activity,
    own_bookmarks: ownBookmarks,
    changed: true,
  };
};

export const addBookmarkToActivities = (
  event: BookmarkAddedEvent,
  activities: ActivityResponse[] | undefined,
  isCurrentUser: boolean,
): UpdateStateResult<{ activities: ActivityResponse[] }> => {
  if (!activities) {
    return { changed: false, activities: [] };
  }

  const activityIndex = activities.findIndex(
    (a) => a.id === event.bookmark.activity.id,
  );
  if (activityIndex === -1) {
    return { changed: false, activities };
  }

  const activity = activities[activityIndex];
  const updatedActivity = addBookmarkToActivity(event, activity, isCurrentUser);
  return updateActivityInState({ updatedActivity, activities });
};

export function handleBookmarkAdded(
  this: Feed,
  event: EventPayload<'feeds.bookmark.added'>,
) {
  const currentActivities = this.currentState.activities;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const isCurrentUser = event.bookmark.user.id === connectedUser?.id;

  const result = addBookmarkToActivities(
    event,
    currentActivities,
    isCurrentUser,
  );

  if (result.changed) {
    this.state.partialNext({ activities: result.activities });
  }
}
