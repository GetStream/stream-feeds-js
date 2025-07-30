import type { Feed } from '../../../feed';
import type {
  ActivityResponse,
  BookmarkDeletedEvent,
  BookmarkResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateActivityInState } from '../activity';

// Helper function to check if two bookmarks are the same
// A bookmark is identified by activity_id + folder_id + user_id
export const isSameBookmark = (
  bookmark1: BookmarkResponse,
  bookmark2: BookmarkResponse,
): boolean => {
  return (
    bookmark1.user.id === bookmark2.user.id &&
    bookmark1.activity.id === bookmark2.activity.id &&
    bookmark1.folder?.id === bookmark2.folder?.id
  );
};

export const removeBookmarkFromActivities = (
  event: BookmarkDeletedEvent,
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
  const updatedActivity = removeBookmarkFromActivity(
    event,
    activity,
    isCurrentUser,
  );
  return updateActivityInState(updatedActivity, activities, true);
};

export const removeBookmarkFromActivity = (
  event: BookmarkDeletedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_bookmarks if the bookmark is from the current user
  const ownBookmarks = isCurrentUser
    ? (activity.own_bookmarks || []).filter(
        (bookmark) => !isSameBookmark(bookmark, event.bookmark),
      )
    : activity.own_bookmarks;

  return {
    ...activity,
    own_bookmarks: ownBookmarks,
    changed: true,
  };
};

export function handleBookmarkDeleted(
  this: Feed,
  event: EventPayload<'feeds.bookmark.deleted'>,
) {
  const currentActivities = this.currentState.activities;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const isCurrentUser = event.bookmark.user.id === connectedUser?.id;

  const result = removeBookmarkFromActivities(
    event,
    currentActivities,
    isCurrentUser,
  );
  if (result.changed) {
    this.state.partialNext({ activities: result.activities });
  }
}
