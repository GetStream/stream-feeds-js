import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import type { Feed, FeedState } from '../../feed';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import { eventTriggeredByConnectedUser } from '../../../utils/event-triggered-by-connected-user';

export type ActivityUnpinnedPayload = PartializeAllBut<
  EventPayload<'feeds.activity.unpinned'>,
  'pinned_activity'
>;

export function handleActivityUnpinned(
  this: Feed,
  event: ActivityUnpinnedPayload,
  fromWs?: boolean,
) {
  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(event, 'activity-unpinned'),
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
    let newState: FeedState | undefined;

    const index =
      currentState.pinned_activities?.findIndex(
        (pinnedActivity) =>
          pinnedActivity.activity.id === event.pinned_activity.activity.id,
      ) ?? -1;

    if (index >= 0) {
      newState ??= {
        ...currentState,
      };

      const newPinnedActivities = [...currentState.pinned_activities!];
      newPinnedActivities.splice(index, 1);

      newState.pinned_activities = newPinnedActivities;
    }

    return newState ?? currentState;
  });
}
