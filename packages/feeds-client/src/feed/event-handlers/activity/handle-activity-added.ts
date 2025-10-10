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
    // TODO: since feed activities are not necessarily ordered by created_at (personalization) we don't order by created_at
    // Maybe we can add a flag to the JS client to support order by created_at
    const updatedActivities = [
      ...(position === 'start' ? newActivitiesDeduplicated : []),
      ...activities,
      ...(position === 'end' ? newActivitiesDeduplicated : []),
    ];
    result = { changed: true, activities: updatedActivities };
  }

  return result;
}

export function handleActivityAdded(
  this: Feed,
  event: EventPayload<'feeds.activity.added'>,
) {
  const currentActivities = this.currentState.activities;
  const result = addActivitiesToState.bind(this)(
    [event.activity],
    currentActivities,
    this.currentState.addNewActivitiesTo,
  );
  if (result.changed) {
    this.client.hydratePollCache([event.activity]);
    this.state.partialNext({ activities: result.activities });
  }
}
