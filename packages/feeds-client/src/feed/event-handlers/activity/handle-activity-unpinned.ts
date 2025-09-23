import type { EventPayload } from '../../../types-internal';
import type { Feed, FeedState } from '../../feed';

export function handleActivityUnpinned(
  this: Feed,
  event: EventPayload<'feeds.activity.unpinned'>,
) {
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
