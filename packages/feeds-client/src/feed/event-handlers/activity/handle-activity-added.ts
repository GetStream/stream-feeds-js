import type { Feed } from '../../feed';
import type { ActivityResponse } from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';

export function addActivitiesToState(
  this: Feed,
  newActivities: ActivityResponse[],
  activities: ActivityResponse[] | undefined,
  position: 'start' | 'end',
) {
  if (activities === undefined) {
    return {
      changed: false,
      activities: [],
    };
  }

  let result = {
    changed: false,
    activities,
  };

  const newActivitiesDeduplicated: ActivityResponse[] = [];
  newActivities.forEach((newActivityResponse) => {
    if (!this.hasActivity(newActivityResponse.id)) {
      newActivitiesDeduplicated.push(newActivityResponse);
    }
  });

  if (newActivitiesDeduplicated.length > 0) {
    const updatedActivities = [
      ...(position === 'start' ? newActivitiesDeduplicated : []),
      ...activities,
      ...(position === 'end' ? newActivitiesDeduplicated : []),
    ];
    this.newActivitiesAdded(newActivitiesDeduplicated);

    result = { changed: true, activities: updatedActivities };
  }

  return result;
}

export function handleActivityAdded(
  this: Feed,
  event: EventPayload<'feeds.activity.added'>,
) {
  if (this.activityAddedEventFilter) {
    if (!this.activityAddedEventFilter(event)) {
      return;
    }
  }
  const currentActivities = this.currentState.activities;
  const result = addActivitiesToState.bind(this)(
    [event.activity],
    currentActivities,
    this.currentState.addNewActivitiesTo,
  );
  if (result.changed) {
    const activity = event.activity;
    this.client.hydratePollCache([activity]);

    const currentFeed = activity.current_feed;

    if (currentFeed) {
      this.client.hydrateCapabilitiesCache([currentFeed]);
    }

    this.state.partialNext({ activities: result.activities });
  }
}
