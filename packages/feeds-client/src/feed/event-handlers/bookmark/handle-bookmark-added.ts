import type { Feed } from '../../../feed';
import type { ActivityResponse, BookmarkAddedEvent } from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateEntityInState } from '../activity';

export const addBookmarkToActivities = (
  event: BookmarkAddedEvent,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
): UpdateStateResult<{ entities: ActivityResponse[] | undefined }> =>
  updateEntityInState({
    entities: activities,
    matcher: (activity) => activity.id === event.bookmark.activity.id,
    updater: (matchedActivity) => {
      let newOwnBookmarks = matchedActivity.own_bookmarks;

      if (eventBelongsToCurrentUser) {
        newOwnBookmarks = [...newOwnBookmarks, event.bookmark];
      }

      return {
        ...matchedActivity,
        own_bookmarks: newOwnBookmarks,
      };
    },
  });

export function handleBookmarkAdded(
  this: Feed,
  event: EventPayload<'feeds.bookmark.added'>,
) {
  const currentActivities = this.currentState.activities;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const eventBelongsToCurrentUser =
    event.bookmark.user.id === connectedUser?.id;

  const result = addBookmarkToActivities(
    event,
    currentActivities,
    eventBelongsToCurrentUser,
  );

  if (result.changed) {
    this.state.partialNext({ activities: result.entities });
  }
}
