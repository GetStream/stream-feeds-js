import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
  BookmarkResponse,
} from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';
import { findBookmarkIndex, isStaleBookmark } from './bookmark-utils';

export type BookmarkAddedPayload = PartializeAllBut<
  EventPayload<'feeds.bookmark.added'>,
  'bookmark'
>;

/**
 * The same add arrives twice (HTTP response + WS broadcast), and the WS copy can be
 * delayed past a later update of the same bookmark. Only apply a payload that adds a
 * bookmark we don't hold yet, or that is fresher than the one we do.
 */
const shouldApplyToOwnBookmarks = (
  ownBookmarks: BookmarkResponse[],
  bookmark: BookmarkResponse,
): boolean => {
  const index = findBookmarkIndex(ownBookmarks, bookmark);

  return index === -1 || !isStaleBookmark(bookmark, ownBookmarks[index]);
};

const sharedUpdateActivity = ({
  currentActivity,
  event,
  eventBelongsToCurrentUser,
}: {
  currentActivity: ActivityResponse;
  event: BookmarkAddedPayload;
  eventBelongsToCurrentUser: boolean;
}): ActivityResponse => {
  let newOwnBookmarks = currentActivity.own_bookmarks;

  if (eventBelongsToCurrentUser) {
    const index = findBookmarkIndex(newOwnBookmarks, event.bookmark);

    if (index === -1) {
      newOwnBookmarks = [...newOwnBookmarks, event.bookmark];
    } else if (!isStaleBookmark(event.bookmark, newOwnBookmarks[index])) {
      newOwnBookmarks = [...newOwnBookmarks];
      newOwnBookmarks[index] = event.bookmark;
    }
  }

  return {
    ...currentActivity,
    bookmark_count: event.bookmark.activity.bookmark_count,
    own_bookmarks: newOwnBookmarks,
  };
};

export const addBookmarkToActivities = (
  event: BookmarkAddedPayload,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) =>
      activity.id === event.bookmark.activity.id &&
      (!eventBelongsToCurrentUser ||
        shouldApplyToOwnBookmarks(activity.own_bookmarks, event.bookmark)),
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        currentActivity: matchedActivity,
        event,
        eventBelongsToCurrentUser,
      }),
  });

export const addBookmarkToPinnedActivities = (
  event: BookmarkAddedPayload,
  pinnedActivities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.bookmark.activity.id &&
      (!eventBelongsToCurrentUser ||
        shouldApplyToOwnBookmarks(
          pinnedActivity.activity.own_bookmarks,
          event.bookmark,
        )),
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

export function handleBookmarkAdded(this: Feed, event: BookmarkAddedPayload) {
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const eventBelongsToCurrentUser =
    event.bookmark.user.id === connectedUser?.id;

  const [result1, result2] = [
    addBookmarkToActivities(
      event,
      currentActivities,
      eventBelongsToCurrentUser,
    ),
    addBookmarkToPinnedActivities(
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
