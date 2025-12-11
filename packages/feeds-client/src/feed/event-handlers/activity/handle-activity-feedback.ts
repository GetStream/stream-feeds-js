import { updateEntityInArray } from '../../../utils';
import { isPin } from '../is-activity-pin';
import type { Feed } from '../../feed';
import type { EventPayload } from '../../../types-internal';
import type { ActivityFeedbackEventPayload, ActivityPinResponse, ActivityResponse } from '../../../gen/models';

const updateActivityFromFeedback = <
  T extends ActivityResponse | ActivityPinResponse,
>(
  feedback: ActivityFeedbackEventPayload,
  activities: T[] | undefined,
) => {
  if (!activities) {
    return {
      changed: false,
      entities: [],
    };
  }
  return updateEntityInArray<T>({
    entities: activities,
    matcher: (e) =>
      isPin(e)
        ? e.activity.id === feedback.activity_id
        : e.id === feedback.activity_id,
    updater: (e) => {
      if (isPin(e)) {
        return {
          ...e,
          activity: {
            ...e.activity,
            hidden: feedback.value === 'true',
          },
        };
      } else {
        return {
          ...e,
          hidden: feedback.value === 'true',
        };
      }
    },
  });
};

export function handleActivityFeedback(
  this: Feed,
  event: EventPayload<'feeds.activity.feedback'>,
) {
  const {
    activities: currentActivities,
    pinned_activities: currentPinnedActivities,
  } = this.currentState;
  const { connected_user: connectedUser } = this.client.state.getLatestValue();
  const eventBelongsToCurrentUser =
    event.activity_feedback.user.id === connectedUser?.id;

  if (!eventBelongsToCurrentUser || event.activity_feedback.action !== 'hide') {
    return;
  }

  const [result1, result2] = [
    updateActivityFromFeedback(event.activity_feedback, currentActivities),
    updateActivityFromFeedback(
      event.activity_feedback,
      currentPinnedActivities,
    ),
  ];

  if (result1.changed || result2.changed) {
    this.state.partialNext({
      activities: result1.entities,
      pinned_activities: result2.entities,
    });
  }
}
