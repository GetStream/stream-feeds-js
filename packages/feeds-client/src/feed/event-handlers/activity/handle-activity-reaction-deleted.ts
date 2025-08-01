import type { Feed } from '../../../feed';
import {
  ActivityReactionDeletedEvent,
  ActivityResponse,
} from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

import { updateEntityInState } from './handle-activity-updated';
export const removeReactionFromActivities = (
  event: ActivityReactionDeletedEvent,
  activities: ActivityResponse[] | undefined,
  eventBelongsToCurrentUser: boolean,
): UpdateStateResult<{ entities: ActivityResponse[] | undefined }> =>
  updateEntityInState({
    entities: activities,
    matcher: (activity) => activity.id === event.activity.id,
    updater: (matchedActivity) => {
      let newOwnReactions = matchedActivity.own_reactions;

      if (eventBelongsToCurrentUser) {
        newOwnReactions = matchedActivity.own_reactions.filter(
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
        own_bookmarks: matchedActivity.own_bookmarks,
      };
    },
  });

export function handleActivityReactionDeleted(
  this: Feed,
  event: EventPayload<'feeds.activity.reaction.deleted'>,
) {
  const currentActivities = this.currentState.activities;
  const connectedUser = this.client.state.getLatestValue().connected_user;
  const eventBelongsToCurrentUser =
    typeof connectedUser !== 'undefined' &&
    event.reaction.user.id === connectedUser.id;

  const result = removeReactionFromActivities(
    event,
    currentActivities,
    eventBelongsToCurrentUser,
  );

  if (result.changed) {
    this.state.partialNext({ activities: result.entities });
  }
}
