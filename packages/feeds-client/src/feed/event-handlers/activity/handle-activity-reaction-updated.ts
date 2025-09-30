import type { Feed } from '../../feed';
import type {
  ActivityPinResponse,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import {
  getStateUpdateQueueId,
  shouldUpdateState,
  updateEntityInArray,
} from '../../../utils';

export type ActivityReactionUpdatedPayload = PartializeAllBut<
  EventPayload<'feeds.activity.reaction.updated'>,
  'activity' | 'reaction'
>;

// shared function to update the activity with the new reaction
const sharedUpdateActivity = ({
  payload,
  currentActivity,
  eventBelongsToCurrentUser,
}: {
  payload: ActivityReactionUpdatedPayload;
  currentActivity: ActivityResponse;
  eventBelongsToCurrentUser: boolean;
}) => {
  const { activity: newActivity, reaction: newReaction } = payload;
  let ownReactions = currentActivity.own_reactions;

  if (eventBelongsToCurrentUser) {
    ownReactions = [newReaction];
  }

  return {
    ...currentActivity,
    latest_reactions: newActivity.latest_reactions,
    reaction_groups: newActivity.reaction_groups,
    reaction_count: newActivity.reaction_count,
    own_reactions: ownReactions,
  };
};

export const updateReactionInActivities = (
  payload: ActivityReactionUpdatedPayload,
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

export const updateReactionInPinnedActivities = (
  payload: ActivityReactionUpdatedPayload,
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

export function handleActivityReactionUpdated(
  this: Feed,
  payload: ActivityReactionUpdatedPayload,
  fromWs?: boolean,
) {
  const connectedUser = this.client.state.getLatestValue().connected_user;

  const eventBelongsToCurrentUser =
    typeof connectedUser !== 'undefined' &&
    payload.reaction.user.id === connectedUser.id;

  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(
        payload,
        'activity-reaction-updated',
      ),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
      isTriggeredByConnectedUser: eventBelongsToCurrentUser,
    })
  ) {
    return;
  }

  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;

  const [result1, result2] = [
    this.hasActivity(payload.activity.id)
      ? updateReactionInActivities(
          payload,
          currentActivities,
          eventBelongsToCurrentUser,
        )
      : undefined,
    updateReactionInPinnedActivities(
      payload,
      currentPinnedActivities,
      eventBelongsToCurrentUser,
    ),
  ];

  if (result1?.changed || result2.changed) {
    this.state.partialNext({
      ...(result1 ? { activities: result1.entities } : {}),
      pinned_activities: result2.entities,
    });
  }
}
