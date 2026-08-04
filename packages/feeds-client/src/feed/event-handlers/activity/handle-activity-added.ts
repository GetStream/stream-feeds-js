import type { Feed } from '../../feed';
import type { ActivityResponse } from '../../../gen/models';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import { eventTriggeredByConnectedUser } from '../../../utils/event-triggered-by-connected-user';

export type ActivityAddedPayload = PartializeAllBut<
  EventPayload<'feeds.activity.added'>,
  'activity'
>;

export function addActivitiesToState(
  this: Feed,
  newActivities: ActivityResponse[],
  activities: ActivityResponse[] | undefined,
  position: 'start' | 'end',
  {
    hasOwnFields,
    backfillOwnFields,
  }: { hasOwnFields: boolean; backfillOwnFields: boolean } = {
    hasOwnFields: true,
    backfillOwnFields: true,
  },
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
    this.activitiesAddedOrUpdated(newActivitiesDeduplicated, {
      hasOwnFields,
      backfillOwnFields,
    });

    result = { changed: true, activities: updatedActivities };
  }

  return result;
}

/**
 * Adding an activity reaches a watched feed twice — once through the HTTP response and
 * once as a WebSocket broadcast — so the two have to be paired off through the state
 * update queue.
 *
 * `hasActivity` alone is not enough: it only says whether the activity is in state right
 * now, so a WS broadcast delayed past a subsequent delete would re-add an activity that
 * has already been removed.
 */
export function shouldApplyActivityAdded(
  this: Feed,
  activity: ActivityResponse,
  fromWs: boolean,
) {
  return shouldUpdateState({
    stateUpdateQueueId: getStateUpdateQueueId({ activity }, 'activity-added'),
    stateUpdateQueue: this.stateUpdateQueue,
    watch: this.currentState.watch,
    fromWs,
    isTriggeredByConnectedUser: eventTriggeredByConnectedUser.call(this, {
      user: activity.user,
    }),
  });
}

export function handleActivityAdded(
  this: Feed,
  payload: ActivityAddedPayload,
  fromWs = true,
) {
  if (!shouldApplyActivityAdded.call(this, payload.activity, fromWs)) {
    return;
  }

  const currentUser = this.client.state.getLatestValue().connected_user;
  const decision = this.resolveNewActivityDecision(
    payload.activity,
    currentUser,
    false,
  );
  if (decision === 'ignore') {
    return;
  }
  const position = decision === 'add-to-end' ? 'end' : 'start';
  const currentActivities = this.currentState.activities;
  const result = addActivitiesToState.bind(this)(
    [payload.activity],
    currentActivities,
    position,
    { hasOwnFields: false, backfillOwnFields: true },
  );
  if (result.changed) {
    const activity = payload.activity;
    this.client.hydratePollCache([activity]);

    this.state.partialNext({ activities: result.activities });
  }
}
