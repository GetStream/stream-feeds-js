import type { Feed } from '../../../feed';
import type {
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

export const removeBookmarkFromActivities = (
  event: BookmarkDeletedEvent,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) => activity.id === event.bookmark.activity.id,
    updater: (matchedActivity) => {
      let newOwnBookmarks = matchedActivity.own_bookmarks;

      if (eventBelongsToCurrentUser) {
        newOwnBookmarks = matchedActivity.own_bookmarks.filter(
          (bookmark) => !isSameBookmark(bookmark, event.bookmark),
        );
      }

      if (newOwnBookmarks === matchedActivity.own_bookmarks) {
        return matchedActivity;
      }

      return {
        ...matchedActivity,
        own_bookmarks: newOwnBookmarks,
      };
    },
  });

export function handleBookmarkDeleted(
  this: Feed,
  event: EventPayload<'feeds.bookmark.deleted'>,
) {
  const currentActivities = this.currentState.activities;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const eventBelongsToCurrentUser =
    event.bookmark.user.id === connectedUser?.id;

  const result = removeBookmarkFromActivities(
    event,
    currentActivities,
    eventBelongsToCurrentUser,
  );

  if (result.changed) {
    this.state.partialNext({ activities: result.entities });
  }
}
