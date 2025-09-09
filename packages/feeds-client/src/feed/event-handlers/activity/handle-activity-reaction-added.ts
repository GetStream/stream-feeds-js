import type { Feed } from '../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
  AddReactionResponse,
} from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';
import {
  getStateUpdateQueueId,
  shouldUpdateState,
  updateEntityInArray,
} from '../../../utils';

type AddActivityReactionPayload =
  | EventPayload<'feeds.activity.reaction.added'>
  | AddReactionResponse;

// shared function to update the activity with the new reaction
const sharedUpdateActivity = ({
  payload,
  currentActivity,
  eventBelongsToCurrentUser,
}: {
  payload: AddActivityReactionPayload;
  currentActivity: ActivityResponse;
  eventBelongsToCurrentUser: boolean;
}) => {
  const { activity: newActivity, reaction: newReaction } = payload;
  let newOwnReactions = currentActivity.own_reactions;

  if (eventBelongsToCurrentUser) {
    newOwnReactions = [...currentActivity.own_reactions, newReaction];
  }

  return {
    ...currentActivity,
    latest_reactions: newActivity.latest_reactions,
    reaction_groups: newActivity.reaction_groups,
    reaction_count: newActivity.reaction_count,
    own_reactions: newOwnReactions,
  };
};

export const addReactionToActivities = (
  payload: AddActivityReactionPayload,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) => activity.id === payload.activity.id,
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        payload,
        currentActivity: matchedActivity,
        eventBelongsToCurrentUser,
      }),
  });

export const addReactionToPinnedActivities = (
  payload: AddActivityReactionPayload,
  pinnedActivities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === payload.activity.id,
    updater: (matchedPinnedActivity) => {
      const updatedActivity = sharedUpdateActivity({
        payload,
        currentActivity: matchedPinnedActivity.activity,
        eventBelongsToCurrentUser,
      });

      // this should never happen, but just in case
      if (updatedActivity === matchedPinnedActivity.activity) {
        return matchedPinnedActivity;
      }

      return {
        ...matchedPinnedActivity,
        activity: updatedActivity,
      };
    },
  });

export function handleActivityReactionAdded(
  this: Feed,
  payload: AddActivityReactionPayload,
) {
  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(
        payload,
        'activity-reaction-created',
      ),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
    })
  ) {
    return;
  }

  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;
  const connectedUser = this.client.state.getLatestValue().connected_user;

  const eventBelongsToCurrentUser =
    typeof connectedUser !== 'undefined' &&
    payload.reaction.user.id === connectedUser.id;

  const [result1, result2] = [
    this.hasActivity(payload.activity.id) ? addReactionToActivities(
      payload,
      currentActivities,
      eventBelongsToCurrentUser,
    ) : undefined,
    addReactionToPinnedActivities(
      payload,
      currentPinnedActivities,
      eventBelongsToCurrentUser,
    ),
  ];

  if (result1?.changed || result2.changed) {
    this.state.partialNext({
      ...(result1 ? {activities: result1.entities} : {}),
      pinned_activities: result2.entities,
    });
  }
}
