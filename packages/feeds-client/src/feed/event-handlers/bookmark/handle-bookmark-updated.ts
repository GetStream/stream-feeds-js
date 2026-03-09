import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';

import { isSameBookmark } from './handle-bookmark-deleted';

export type BookmarkUpdatedPayload = PartializeAllBut<
  EventPayload<'feeds.bookmark.updated'>,
  'bookmark'
>;

const sharedUpdateActivity = ({
  currentActivity,
  event,
  eventBelongsToCurrentUser,
}: {
  currentActivity: ActivityResponse;
  event: BookmarkUpdatedPayload;
  eventBelongsToCurrentUser: boolean;
}): ActivityResponse => {
  let newOwnBookmarks = currentActivity.own_bookmarks;

  if (eventBelongsToCurrentUser) {
    const bookmarkIndex = newOwnBookmarks.findIndex(
      (bookmark) =>
        bookmark.user.id === event.bookmark.user.id &&
        bookmark.activity.id === event.bookmark.activity.id &&
        bookmark.folder?.id === event.bookmark.folder?.id,
    );

    if (bookmarkIndex !== -1) {
      newOwnBookmarks = [...newOwnBookmarks];
      newOwnBookmarks[bookmarkIndex] = event.bookmark;
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
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) =>
      activity.id === event.bookmark.activity.id &&
      (!eventBelongsToCurrentUser ||
        !activity.own_bookmarks.some((b) => isSameBookmark(b, event.bookmark))),
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        currentActivity: matchedActivity,
        event,
        eventBelongsToCurrentUser,
      }),
  });

export const updateBookmarkInPinnedActivities = (
  event: BookmarkUpdatedPayload,
  pinnedActivities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.bookmark.activity.id &&
      (!eventBelongsToCurrentUser ||
        !pinnedActivity.activity.own_bookmarks.some((b) =>
          isSameBookmark(b, event.bookmark),
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

export function handleBookmarkUpdated(
  this: Feed,
  event: BookmarkUpdatedPayload,
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
    ),
    updateBookmarkInPinnedActivities(
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
