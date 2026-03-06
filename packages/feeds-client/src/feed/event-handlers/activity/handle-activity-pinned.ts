import type { ActivityPinResponse } from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import type { Feed } from '../../feed';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import { eventTriggeredByConnectedUser } from '../../../utils/event-triggered-by-connected-user';

export type ActivityPinnedPayload = PartializeAllBut<
  EventPayload<'feeds.activity.pinned'>,
  'pinned_activity'
>;

export function handleActivityPinned(
  this: Feed,
  event: ActivityPinnedPayload,
  fromWs?: boolean,
) {
  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(event, 'activity-pinned'),
      stateUpdateQueue: this.stateUpdateQueue,
      watch: this.currentState.watch,
      fromWs,
      isTriggeredByConnectedUser: eventTriggeredByConnectedUser.call(
        this,
        event,
      ),
    })
  ) {
    return;
  }

  this.state.next((currentState) => {
    const newState = {
      ...currentState,
    };

    // FIXME: type mismatch PinActivityResponse vs ActivityPinResponse (almost identical but not quite)

    // re-map the event value to match the ActivityPinResponse type
    const pinnedActivity: ActivityPinResponse = {
      ...event.pinned_activity,
      user: event.user!,
      updated_at: new Date(),
    };

    newState.pinned_activities = currentState.pinned_activities
      ? [pinnedActivity, ...currentState.pinned_activities]
      : [pinnedActivity];

    return newState;
  });
}
