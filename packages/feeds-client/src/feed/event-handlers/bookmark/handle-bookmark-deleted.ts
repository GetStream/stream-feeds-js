import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
  BookmarkResponse,
} from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';
import { findBookmarkIndex, isStaleBookmark } from './bookmark-utils';

export type BookmarkDeletedPayload = PartializeAllBut<
  EventPayload<'feeds.bookmark.deleted'>,
  'bookmark'
>;

/**
 * -1 when there is nothing to remove: either we never had the bookmark (the delete
 * already arrived over the other channel), or the entry we hold is newer than the delete
 * payload, meaning the bookmark has been re-added since and this is a late delete.
 */
const findBookmarkToRemove = (
  ownBookmarks: BookmarkResponse[],
  bookmark: BookmarkResponse,
): number => {
  const index = findBookmarkIndex(ownBookmarks, bookmark);

  return index !== -1 && isStaleBookmark(ownBookmarks[index], bookmark)
    ? index
    : -1;
};

const sharedUpdateActivity = ({
  currentActivity,
  event,
  eventBelongsToCurrentUser,
}: {
  currentActivity: ActivityResponse;
  event: BookmarkDeletedPayload;
  eventBelongsToCurrentUser: boolean;
}): ActivityResponse => {
  let newOwnBookmarks = currentActivity.own_bookmarks;

  if (eventBelongsToCurrentUser) {
    const index = findBookmarkToRemove(newOwnBookmarks, event.bookmark);

    if (index !== -1) {
      newOwnBookmarks = newOwnBookmarks.filter((_, i) => i !== index);
    }
  }

  return {
    ...currentActivity,
    bookmark_count: event.bookmark.activity.bookmark_count,
    own_bookmarks: newOwnBookmarks,
  };
};

export const removeBookmarkFromActivities = (
  event: BookmarkDeletedPayload,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) =>
      activity.id === event.bookmark.activity.id &&
      (!eventBelongsToCurrentUser ||
        findBookmarkToRemove(activity.own_bookmarks, event.bookmark) !== -1),
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        currentActivity: matchedActivity,
        event,
        eventBelongsToCurrentUser,
      }),
  });

export const removeBookmarkFromPinnedActivities = (
  event: BookmarkDeletedPayload,
  pinnedActivities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.bookmark.activity.id &&
      (!eventBelongsToCurrentUser ||
        findBookmarkToRemove(
          pinnedActivity.activity.own_bookmarks,
          event.bookmark,
        ) !== -1),
    updater: (matchedPinnedActivity) => {
      const newActivity = sharedUpdateActivity({
        currentActivity: matchedPinnedActivity.activity,
        event,
        eventBelongsToCurrentUser,
      });

      if (newActivity === matchedPinnedActivity.activity) {
        return matchedPinnedActivity;
      }

      return {
        ...matchedPinnedActivity,
        activity: newActivity,
      };
    },
  });

export function handleBookmarkDeleted(
  this: Feed,
  event: BookmarkDeletedPayload,
) {
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const eventBelongsToCurrentUser =
    event.bookmark.user.id === connectedUser?.id;

  const [result1, result2] = [
    removeBookmarkFromActivities(
      event,
      currentActivities,
      eventBelongsToCurrentUser,
    ),
    removeBookmarkFromPinnedActivities(
      event,
      currentPinnedActivities,
      eventBelongsToCurrentUser,
    ),
  ];

  if (result1.changed || result2.changed) {
    this.state.partialNext({
      activities: result1.entities,
      pinned_activities: result2.entities,
    });
  }
}
