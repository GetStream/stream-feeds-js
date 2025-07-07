import {
  BookmarkAddedEvent,
  BookmarkDeletedEvent,
  BookmarkUpdatedEvent,
  ActivityResponse,
} from '../gen/models';
import { UpdateStateResult } from '../types-internal';

const updateActivityInActivities = (
  updatedActivity: ActivityResponse,
  activities: ActivityResponse[],
): UpdateStateResult<{ activities: ActivityResponse[] }> => {
  const index = activities.findIndex((a) => a.id === updatedActivity.id);
  if (index !== -1) {
    const newActivities = [...activities];
    newActivities[index] = updatedActivity;
    return { changed: true, activities: newActivities };
  } else {
    return { changed: false, activities };
  }
};

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

export const removeBookmarkFromActivity = (
  event: BookmarkDeletedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_bookmarks if the bookmark is from the current user
  const ownBookmarks = isCurrentUser
    ? (activity.own_bookmarks || []).filter(
        (bookmark) =>
          bookmark.user.id !== event.bookmark.user.id ||
          bookmark.activity.id !== event.bookmark.activity.id,
      )
    : activity.own_bookmarks;

  return {
    ...activity,
    own_bookmarks: ownBookmarks,
    changed: true,
  };
};

export const updateBookmarkInActivity = (
  event: BookmarkUpdatedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_bookmarks if the bookmark is from the current user
  let ownBookmarks = activity.own_bookmarks || [];
  if (isCurrentUser) {
    const bookmarkIndex = ownBookmarks.findIndex(
      (bookmark) =>
        bookmark.user.id === event.bookmark.user.id &&
        bookmark.activity.id === event.bookmark.activity.id,
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
  return updateActivityInActivities(updatedActivity, activities);
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
  return updateActivityInActivities(updatedActivity, activities);
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
  return updateActivityInActivities(updatedActivity, activities);
};
