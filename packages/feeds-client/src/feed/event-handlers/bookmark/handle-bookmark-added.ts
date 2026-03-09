import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';
import { isSameBookmark } from './handle-bookmark-deleted';

export type BookmarkAddedPayload = PartializeAllBut<
  EventPayload<'feeds.bookmark.added'>,
  'bookmark'
>;

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
    newOwnBookmarks = [...newOwnBookmarks, event.bookmark];
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
        !activity.own_bookmarks.some((b) => isSameBookmark(b, event.bookmark))),
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
