import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
  BookmarkResponse,
} from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';

import type { BookmarkUpdateOptions } from './bookmark-utils';
import { findBookmarkIndexForUpdate, isStaleBookmark } from './bookmark-utils';

export type BookmarkUpdatedPayload = PartializeAllBut<
  EventPayload<'feeds.bookmark.updated'>,
  'bookmark'
>;

/**
 * -1 when there is nothing to update: either the bookmark isn't in state, or the payload
 * carries nothing newer than what we already applied (the same change reaches us over
 * both HTTP and the WebSocket).
 */
const findBookmarkToUpdate = (
  ownBookmarks: BookmarkResponse[],
  bookmark: BookmarkResponse,
  options?: BookmarkUpdateOptions,
): number => {
  const index = findBookmarkIndexForUpdate(ownBookmarks, bookmark, options);

  return index !== -1 && !isStaleBookmark(bookmark, ownBookmarks[index])
    ? index
    : -1;
};

const sharedUpdateActivity = ({
  currentActivity,
  event,
  eventBelongsToCurrentUser,
  options,
}: {
  currentActivity: ActivityResponse;
  event: BookmarkUpdatedPayload;
  eventBelongsToCurrentUser: boolean;
  options?: BookmarkUpdateOptions;
}): ActivityResponse => {
  let newOwnBookmarks = currentActivity.own_bookmarks;

  if (eventBelongsToCurrentUser) {
    const index = findBookmarkToUpdate(
      newOwnBookmarks,
      event.bookmark,
      options,
    );

    if (index !== -1) {
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

export const updateBookmarkInActivities = (
  event: BookmarkUpdatedPayload,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
  options?: BookmarkUpdateOptions,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) =>
      activity.id === event.bookmark.activity.id &&
      (!eventBelongsToCurrentUser ||
        findBookmarkToUpdate(
          activity.own_bookmarks,
          event.bookmark,
          options,
        ) !== -1),
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        currentActivity: matchedActivity,
        event,
        eventBelongsToCurrentUser,
        options,
      }),
  });

export const updateBookmarkInPinnedActivities = (
  event: BookmarkUpdatedPayload,
  pinnedActivities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
  options?: BookmarkUpdateOptions,
) =>
  updateEntityInArray({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.bookmark.activity.id &&
      (!eventBelongsToCurrentUser ||
        findBookmarkToUpdate(
          pinnedActivity.activity.own_bookmarks,
          event.bookmark,
          options,
        ) !== -1),
    updater: (matchedPinnedActivity) => {
      const newActivity = sharedUpdateActivity({
        currentActivity: matchedPinnedActivity.activity,
        event,
        eventBelongsToCurrentUser,
        options,
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

export function handleBookmarkUpdated(
  this: Feed,
  event: BookmarkUpdatedPayload,
  options?: BookmarkUpdateOptions,
) {
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const eventBelongsToCurrentUser =
    event.bookmark.user.id === connectedUser?.id;

  const [result1, result2] = [
    updateBookmarkInActivities(
      event,
      currentActivities,
      eventBelongsToCurrentUser,
      options,
    ),
    updateBookmarkInPinnedActivities(
      event,
      currentPinnedActivities,
      eventBelongsToCurrentUser,
      options,
    ),
  ];

  if (result1.changed || result2.changed) {
    this.state.partialNext({
      activities: result1.entities,
      pinned_activities: result2.entities,
    });
  }
}
