import type { Feed } from '../../../feed';
import {
  ActivityPinResponse,
  ActivityReactionDeletedEvent,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';

const sharedUpdateActivity = ({
  currentActivity,
  event,
  eventBelongsToCurrentUser,
}: {
  currentActivity: ActivityResponse;
  event: ActivityReactionDeletedEvent;
  eventBelongsToCurrentUser: boolean;
}) => {
  let newOwnReactions = currentActivity.own_reactions;

  if (eventBelongsToCurrentUser) {
    newOwnReactions = currentActivity.own_reactions.filter(
      (reaction) =>
        !(
          reaction.type === event.reaction.type &&
          reaction.user.id === event.reaction.user.id
        ),
    );
  }

  return {
    ...event.activity,
    own_reactions: newOwnReactions,
    own_bookmarks: currentActivity.own_bookmarks,
  };
};

export const removeReactionFromActivities = (
  event: ActivityReactionDeletedEvent,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) => activity.id === event.activity.id,
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        currentActivity: matchedActivity,
        event,
        eventBelongsToCurrentUser,
      }),
  });

export const removeReactionFromPinnedActivities = (
  event: ActivityReactionDeletedEvent,
  activities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.activity.id,
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

export function handleActivityReactionDeleted(
  this: Feed,
  event: EventPayload<'feeds.activity.reaction.deleted'>,
) {
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;
  const connectedUser = this.client.state.getLatestValue().connected_user;
  const eventBelongsToCurrentUser =
    typeof connectedUser !== 'undefined' &&
    event.reaction.user.id === connectedUser.id;

  const [result1, result2] = [
    removeReactionFromActivities(
      event,
      currentActivities,
      eventBelongsToCurrentUser,
    ),
    removeReactionFromPinnedActivities(
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
