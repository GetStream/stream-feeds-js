import type { Feed } from '../../feed';
import type { ActivityResponse } from '../../../gen/models';
import type { EventPayload } from '../../../types-internal';

export function addActivitiesToState(
  this: Feed,
  newActivities: ActivityResponse[],
  activities: ActivityResponse[] | undefined,
  position: 'start' | 'end',
  { hasOwnFields }: { hasOwnFields: boolean } = { hasOwnFields: true },
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
    this.newActivitiesAdded(newActivitiesDeduplicated, { hasOwnFields });

    result = { changed: true, activities: updatedActivities };
  }

  return result;
}

export function handleActivityAdded(
  this: Feed,
  event: EventPayload<'feeds.activity.added'>,
) {
  const currentUser = this.client.state.getLatestValue().connected_user;
  const decision = this.resolveNewActivityDecision(
    event.activity,
    currentUser,
    false,
  );
  if (decision === 'ignore') {
    return;
  }
  const position = decision === 'add-to-end' ? 'end' : 'start';
  const currentActivities = this.currentState.activities;
  const result = addActivitiesToState.bind(this)(
    [event.activity],
    currentActivities,
    position,
    { hasOwnFields: false },
  );
  if (result.changed) {
    const activity = event.activity;
    this.client.hydratePollCache([activity]);

    this.state.partialNext({ activities: result.activities });
  }
}
