import type { Feed } from '../../../feed';
import type {
  ActivityResponse,
  BookmarkUpdatedEvent,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateActivityInState } from '../activity';
import { isSameBookmark } from './handle-bookmark-deleted';

export const updateBookmarkInActivity = (
  event: BookmarkUpdatedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_bookmarks if the bookmark is from the current user
  let ownBookmarks = activity.own_bookmarks || [];
  if (isCurrentUser) {
    const bookmarkIndex = ownBookmarks.findIndex((bookmark) =>
      isSameBookmark(bookmark, event.bookmark),
    );
    if (bookmarkIndex !== -1) {
      ownBookmarks = [...ownBookmarks];
      ownBookmarks[bookmarkIndex] = event.bookmark;
    }
  }

  return {
    ...activity,
    own_bookmarks: ownBookmarks,
    changed: true,
  };
};

export const updateBookmarkInActivities = (
  event: BookmarkUpdatedEvent,
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
  const updatedActivity = updateBookmarkInActivity(
    event,
    activity,
    isCurrentUser,
  );
  return updateActivityInState(updatedActivity, activities, true);
};

export function handleBookmarkUpdated(
  this: Feed,
  event: EventPayload<'feeds.bookmark.updated'>,
) {
  const currentActivities = this.currentState.activities;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const isCurrentUser = event.bookmark.user.id === connectedUser?.id;

  const result = updateBookmarkInActivities(
    event,
    currentActivities,
    isCurrentUser,
  );
  if (result.changed) {
    this.state.partialNext({ activities: result.activities });
  }
}
