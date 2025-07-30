import { Feed } from '../../../feed';
import { EventPayload } from '../../../types-internal';
import { removeActivityFromState } from './handle-activity-deleted';

export function handleActivityRemovedFromFeed(
  this: Feed,
  event: EventPayload<'feeds.activity.removed_from_feed'>,
) {
  const currentActivities = this.currentState.activities;
  if (currentActivities) {
    const result = removeActivityFromState(event.activity, currentActivities);
    if (result.changed) {
      this.state.partialNext({ activities: result.activities });
    }
  }
}
