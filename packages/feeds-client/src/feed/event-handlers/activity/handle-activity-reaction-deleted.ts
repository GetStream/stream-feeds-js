import type { Feed } from '../../feed';
import { ActivityPinResponse, ActivityResponse } from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import {
  getStateUpdateQueueId,
  shouldUpdateState,
  updateEntityInArray,
} from '../../../utils';

type ActivityReactionDeletedPayload = PartializeAllBut<
  EventPayload<'feeds.activity.reaction.deleted'>,
  'activity' | 'reaction'
>;

const sharedUpdateActivity = ({
  currentActivity,
  payload,
  eventBelongsToCurrentUser,
}: {
  currentActivity: ActivityResponse;
  payload: ActivityReactionDeletedPayload;
  eventBelongsToCurrentUser: boolean;
}) => {
  const { activity: newActivity, reaction: newReaction } = payload;
  let newOwnReactions = currentActivity.own_reactions;

  if (eventBelongsToCurrentUser) {
    newOwnReactions = currentActivity.own_reactions.filter(
      (reaction) =>
        !(
          reaction.type === newReaction.type &&
          reaction.user.id === newReaction.user.id
        ),
    );
  }

  return {
    ...currentActivity,
    latest_reactions: newActivity.latest_reactions,
    reaction_groups: newActivity.reaction_groups,
    reaction_count: newActivity.reaction_count,
    own_reactions: newOwnReactions,
  };
};

export const removeReactionFromActivities = (
  payload: ActivityReactionDeletedPayload,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (activity) => activity.id === payload.activity.id,
    updater: (matchedActivity) =>
      sharedUpdateActivity({
        currentActivity: matchedActivity,
        payload,
        eventBelongsToCurrentUser,
      }),
  });

export const removeReactionFromPinnedActivities = (
  payload: ActivityReactionDeletedPayload,
  activities: ActivityPinResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
) =>
  updateEntityInArray({
    entities: activities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === payload.activity.id,
    updater: (matchedPinnedActivity) => {
      const newActivity = sharedUpdateActivity({
        currentActivity: matchedPinnedActivity.activity,
        payload,
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
  payload: ActivityReactionDeletedPayload,
  fromWs?: boolean,
) {
  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(
        payload,
        'activity-reaction-deleted',
      ),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
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
    this.hasActivity(payload.activity.id)
      ? removeReactionFromActivities(
          payload,
          currentActivities,
          eventBelongsToCurrentUser,
        )
      : undefined,
    removeReactionFromPinnedActivities(
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
