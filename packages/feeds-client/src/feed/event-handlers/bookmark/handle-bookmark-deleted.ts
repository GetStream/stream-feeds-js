import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
  BookmarkDeletedEvent,
  BookmarkResponse,
} from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';

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

const sharedUpdateActivity = ({
  currentActivity,
  event,
  eventBelongsToCurrentUser,
}: {
  currentActivity: ActivityResponse;
  event: BookmarkDeletedEvent;
  eventBelongsToCurrentUser: boolean;
}): ActivityResponse => {
  let newOwnBookmarks = currentActivity.own_bookmarks;

  if (eventBelongsToCurrentUser) {
    newOwnBookmarks = currentActivity.own_bookmarks.filter(
      (bookmark) => !isSameBookmark(bookmark, event.bookmark),
    );
  }

  return {
    ...event.bookmark.activity,
    own_bookmarks: newOwnBookmarks,
    own_reactions: currentActivity.own_reactions,
  };
};

export const removeBookmarkFromActivities = (
  event: BookmarkDeletedEvent,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) => activity.id === event.bookmark.activity.id,
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        currentActivity: matchedActivity,
        event,
        eventBelongsToCurrentUser,
      }),
  });

export const removeBookmarkFromPinnedActivities = (
  event: BookmarkDeletedEvent,
  pinnedActivities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.bookmark.activity.id,
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
  event: EventPayload<'feeds.bookmark.deleted'>,
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
