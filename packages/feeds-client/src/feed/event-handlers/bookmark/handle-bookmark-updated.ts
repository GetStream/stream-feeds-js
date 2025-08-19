import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
  BookmarkUpdatedEvent,
} from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';

import { isSameBookmark } from './handle-bookmark-deleted';

const sharedUpdateActivity = ({
  currentActivity,
  event,
  eventBelongsToCurrentUser,
}: {
  currentActivity: ActivityResponse;
  event: BookmarkUpdatedEvent;
  eventBelongsToCurrentUser: boolean;
}): ActivityResponse => {
  let newOwnBookmarks = currentActivity.own_bookmarks;

  if (eventBelongsToCurrentUser) {
    const bookmarkIndex = newOwnBookmarks.findIndex((bookmark) =>
      isSameBookmark(bookmark, event.bookmark),
    );

    if (bookmarkIndex !== -1) {
      newOwnBookmarks = [...newOwnBookmarks];
      newOwnBookmarks[bookmarkIndex] = event.bookmark;
    }
  }

  return {
    ...event.bookmark.activity,
    own_bookmarks: newOwnBookmarks,
    own_reactions: currentActivity.own_reactions,
  };
};

export const updateBookmarkInActivities = (
  event: BookmarkUpdatedEvent,
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

export const updateBookmarkInPinnedActivities = (
  event: BookmarkUpdatedEvent,
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

export function handleBookmarkUpdated(
  this: Feed,
  event: EventPayload<'feeds.bookmark.updated'>,
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
