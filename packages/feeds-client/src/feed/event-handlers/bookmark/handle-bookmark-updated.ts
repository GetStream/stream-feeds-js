import type { Feed } from '../../../feed';
import type {
  ActivityResponse,
  BookmarkUpdatedEvent,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateEntityInState } from '../activity';
import { isSameBookmark } from './handle-bookmark-deleted';

export const updateBookmarkInActivities = (
  event: BookmarkUpdatedEvent,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
): UpdateStateResult<{ entities: ActivityResponse[] | undefined }> =>
  updateEntityInState({
    entities: activities,
    matcher: (a) => a.id === event.bookmark.activity.id,
    updater: (matchedActivity) => {
      let newOwnBookmarks = matchedActivity.own_bookmarks;

      if (eventBelongsToCurrentUser) {
        const bookmarkIndex = newOwnBookmarks.findIndex((bookmark) =>
          isSameBookmark(bookmark, event.bookmark),
        );

        if (bookmarkIndex !== -1) {
          newOwnBookmarks = [...newOwnBookmarks];
          newOwnBookmarks[bookmarkIndex] = event.bookmark;
        }
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

export function handleBookmarkUpdated(
  this: Feed,
  event: EventPayload<'feeds.bookmark.updated'>,
) {
  const currentActivities = this.currentState.activities;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const eventBelongsToCurrentUser =
    event.bookmark.user.id === connectedUser?.id;

  const result = updateBookmarkInActivities(
    event,
    currentActivities,
    eventBelongsToCurrentUser,
  );

  if (result.changed) {
    this.state.partialNext({ activities: result.entities });
  }
}
