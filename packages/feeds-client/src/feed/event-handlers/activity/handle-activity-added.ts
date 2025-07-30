import { Feed } from '../../../feed';
import { ActivityResponse } from '../../../gen/models';
import { EventPayload, UpdateStateResult } from '../../../types-internal';

export const addActivitiesToState = (
  newActivities: ActivityResponse[],
  activities: ActivityResponse[] | undefined,
  position: 'start' | 'end',
) => {
  let result: UpdateStateResult<{ activities: ActivityResponse[] }>;
  if (activities === undefined) {
    activities = [];
    result = {
      changed: true,
      activities,
    };
  } else {
    result = {
      changed: false,
      activities,
    };
  }

  const newActivitiesDeduplicated: ActivityResponse[] = [];
  newActivities.forEach((newActivityResponse) => {
    const index = activities.findIndex((a) => a.id === newActivityResponse.id);
    if (index === -1) {
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
};

export function handleActivityAdded(
  this: Feed,
  event: EventPayload<'feeds.activity.added'>,
) {
  const currentActivities = this.currentState.activities;
  const result = addActivitiesToState(
    [event.activity],
    currentActivities,
    'start',
  );
  if (result.changed) {
    this.client.hydratePollCache([event.activity]);
    this.state.partialNext({ activities: result.activities });
  }
}
