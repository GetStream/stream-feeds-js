import { Feed, FeedState } from '../../../feed';
import {
  ActivityPinResponse,
  ActivityResponse,
  ActivityUpdatedEvent,
} from '../../../gen/models';
import { EventPayload } from '../../../types-internal';

export const updateActivityInState = (
  event: ActivityUpdatedEvent,
  activities: ActivityResponse[],
) =>
  updateEntityInState({
    entities: activities,
    matcher: (a) => a.id === event.activity.id,
    updater: (matchedActivity) => {
      return {
        ...event.activity,
        own_reactions: matchedActivity.own_reactions,
        own_bookmarks: matchedActivity.own_bookmarks,
      };
    },
  });

export const updatePinnedActivityInState = (
  event: ActivityUpdatedEvent,
  pinnedActivities: ActivityPinResponse[] | undefined,
) =>
  updateEntityInState({
    entities: pinnedActivities,
    matcher: (pinnedActivity) =>
      pinnedActivity.activity.id === event.activity.id,
    updater: (matchedPinnedActivity) => {
      return {
        ...matchedPinnedActivity,
        activity: {
          ...event.activity,
          own_reactions: matchedPinnedActivity.activity.own_reactions,
          own_bookmarks: matchedPinnedActivity.activity.own_bookmarks,
        },
      };
    },
  });

export function handleActivityUpdated(
  this: Feed,
  event: EventPayload<'feeds.activity.updated'>,
) {
  this.client.hydratePollCache([event.activity]);

  this.state.next((currentState) => {
    const {
      activities: currentActivities,
      pinned_activities: currentPinnedActivities,
    } = currentState;

    let newState: FeedState | undefined;

    if (currentActivities) {
      const result = updateActivityInState(event, currentActivities);

      if (result.changed) {
        newState ??= {
          ...currentState,
        };
        newState.activities = result.entities;
      }
    }

    if (currentPinnedActivities) {
      const result = updatePinnedActivityInState(
        event,
        currentPinnedActivities,
      );

      if (result.changed) {
        newState ??= {
          ...currentState,
        };
        newState.pinned_activities = result.entities;
      }
    }

    return newState ?? currentState;
  });
}

export const updateEntityInState = <T>({
  matcher,
  updater,
  entities,
}: {
  matcher: (entity: T) => boolean;
  entities: T[] | undefined;
  updater: (currentEntity: T) => T;
}) => {
  if (!entities || !entities.length) {
    return { changed: false, entities };
  }

  const index = entities.findIndex(matcher);

  if (index === -1) {
    return { changed: false, entities };
  }

  const updatedEntities = [...entities];
  const newEntity = updater(updatedEntities[index]);

  if (newEntity === updatedEntities[index]) {
    return { changed: false, entities };
  }

  updatedEntities[index] = newEntity;

  return { changed: true, entities: updatedEntities };
};
