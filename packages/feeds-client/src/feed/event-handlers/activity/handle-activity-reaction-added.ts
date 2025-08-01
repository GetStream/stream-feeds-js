import type { Feed } from '../../../feed';
import type {
  ActivityReactionAddedEvent,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateEntityInState } from './handle-activity-updated';

export const addReactionToActivities = (
  event: ActivityReactionAddedEvent,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
): UpdateStateResult<{ entities: ActivityResponse[] | undefined }> =>
  updateEntityInState({
    entities: activities,
    matcher: (activity) => activity.id === event.activity.id,
    updater: (matchedActivity) => {
      let newOwnReactions = matchedActivity.own_reactions;

      if (eventBelongsToCurrentUser) {
        newOwnReactions = [...matchedActivity.own_reactions, event.reaction];
      }

      return {
        ...event.activity,
        own_reactions: newOwnReactions,
        own_bookmarks: matchedActivity.own_bookmarks,
      };
    },
  });

export function handleActivityReactionAdded(
  this: Feed,
  event: EventPayload<'feeds.activity.reaction.added'>,
) {
  const currentActivities = this.currentState.activities;
  const connectedUser = this.client.state.getLatestValue().connected_user;
  const eventBelongsToCurrentUser =
    typeof connectedUser !== 'undefined' &&
    event.reaction.user.id === connectedUser.id;

  // TODO: handle pinned activities

  const result = addReactionToActivities(
    event,
    currentActivities,
    eventBelongsToCurrentUser,
  );
  if (result.changed) {
    this.state.partialNext({ activities: result.entities });
  }
}
