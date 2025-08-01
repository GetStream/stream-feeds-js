import { ActivityPinResponse } from '../../../gen/models';
import { EventPayload } from '../../../types-internal';
import { Feed } from '../../feed';

export function handleActivityPinned(
  this: Feed,
  event: EventPayload<'feeds.activity.pinned'>,
) {
  this.state.next((currentState) => {
    const newState = {
      ...currentState,
    };

    // FIXME: type mismatch PinActivityResponse vs ActivityPinResponse (almost identical but not quite)

    // re-map the event value to match the ActivityPinResponse type
    const pinnedActivity: ActivityPinResponse = {
      ...event.pinned_activity,
      user: event.user!,
      feed: event.fid,
      updated_at: new Date(),
    };

    newState.pinned_activities = currentState.pinned_activities
      ? [pinnedActivity, ...currentState.pinned_activities]
      : [pinnedActivity];

    return newState;
  });
}
