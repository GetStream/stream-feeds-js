import type { Feed } from '../../../feed';
import type {
  ActivityPinResponse,
  ActivityReactionAddedEvent,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';
import { updateEntityInArray } from '../../../utils';

// shared function to update the activity with the new reaction
const sharedUpdateActivity = ({
  currentActivity,
  event,
  eventBelongsToCurrentUser,
}: {
  currentActivity: ActivityResponse;
  event: ActivityReactionAddedEvent;
  eventBelongsToCurrentUser: boolean;
}) => {
  let newOwnReactions = currentActivity.own_reactions;

  if (eventBelongsToCurrentUser) {
    newOwnReactions = [...currentActivity.own_reactions, event.reaction];
  }

  return {
    ...event.activity,
    own_reactions: newOwnReactions,
    own_bookmarks: currentActivity.own_bookmarks,
  };
};

export const addReactionToActivities = (
  event: ActivityReactionAddedEvent,
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

export const addReactionToPinnedActivities = (
  event: ActivityReactionAddedEvent,
  pinnedActivities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.activity.id,
    updater: (matchedPinnedActivity) => {
      const newActivity = sharedUpdateActivity({
        currentActivity: matchedPinnedActivity.activity,
        event,
        eventBelongsToCurrentUser,
      });

      // this should never happen, but just in case
      if (newActivity === matchedPinnedActivity.activity) {
        return matchedPinnedActivity;
      }

      return {
        ...matchedPinnedActivity,
        activity: newActivity,
      };
    },
  });

export function handleActivityReactionAdded(
  this: Feed,
  event: EventPayload<'feeds.activity.reaction.added'>,
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
    addReactionToActivities(
      event,
      currentActivities,
      eventBelongsToCurrentUser,
    ),
    addReactionToPinnedActivities(
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
