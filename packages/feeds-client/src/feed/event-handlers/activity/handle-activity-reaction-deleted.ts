import type { Feed } from '../../../feed';
import type {
  ActivityReactionDeletedEvent,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateActivityInState } from './handle-activity-updated';
export const removeReactionFromActivity = (
  event: ActivityReactionDeletedEvent,
  activity: ActivityResponse,
  isCurrentUser: boolean,
): UpdateStateResult<ActivityResponse> => {
  // Update own_reactions if the reaction is from the current user
  const ownReactions = isCurrentUser
    ? (activity.own_reactions || []).filter(
        (r) =>
          !(
            r.type === event.reaction.type &&
            r.user.id === event.reaction.user.id
          ),
      )
    : activity.own_reactions;

  return {
    ...activity,
    own_reactions: ownReactions,
    latest_reactions: event.activity.latest_reactions,
    reaction_groups: event.activity.reaction_groups,
    changed: true,
  };
};

export const removeReactionFromActivities = (
  event: ActivityReactionDeletedEvent,
  activities: ActivityResponse[] | undefined,
  isCurrentUser: boolean,
): UpdateStateResult<{ activities: ActivityResponse[] }> => {
  if (!activities) {
    return { changed: false, activities: [] };
  }

  const activityIndex = activities.findIndex((a) => a.id === event.activity.id);
  if (activityIndex === -1) {
    return { changed: false, activities };
  }

  const activity = activities[activityIndex];
  const updatedActivity = removeReactionFromActivity(
    event,
    activity,
    isCurrentUser,
  );
  return updateActivityInState(updatedActivity, activities, true);
};

export function handleActivityReactionDeleted(
  this: Feed,
  event: EventPayload<'feeds.activity.reaction.deleted'>,
) {
  const currentActivities = this.currentState.activities;
  const connectedUser = this.client.state.getLatestValue().connected_user;
  const isCurrentUser = Boolean(
    connectedUser && event.reaction.user.id === connectedUser.id,
  );

  const result = removeReactionFromActivities(
    event,
    currentActivities,
    isCurrentUser,
  );
  if (result.changed) {
    this.state.partialNext({ activities: result.activities });
  }
}
