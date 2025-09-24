import type { Feed } from '../../feed';
import type { ActivityResponse } from '../../../gen/models';
import type { EventPayload, UpdateStateResult } from '../../../types-internal';

export function addActivitiesToState(
  this: Feed,
  newActivities: ActivityResponse[],
  activities: ActivityResponse[] | undefined,
  position: 'start' | 'end',
) {
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
    'start',
  );
  if (result.changed) {
    const activity = event.activity;
    this.client.hydratePollCache([activity]);

    const currentFeed = activity.current_feed;
    
    if (currentFeed) {
      if (currentFeed?.own_capabilities) {
        this.client.hydrateCapabilitiesCache([currentFeed]);
      } else {
        this.client.queryFeeds({ filter: { feed: currentFeed.feed }}).catch(error => {
          // FIXME: move to bubbling local error event
          console.error(error);
        })
      }
    }

    this.state.partialNext({ activities: result.activities });
  }
}
