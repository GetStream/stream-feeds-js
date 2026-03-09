import type { Feed, FeedState } from '../../../feed';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import { eventTriggeredByConnectedUser } from '../../../utils/event-triggered-by-connected-user';

export type FeedMemberRemovedPayload = PartializeAllBut<
  EventPayload<'feeds.feed_member.removed'>,
  'member_id'
>;

export function handleFeedMemberRemoved(
  this: Feed,
  event: FeedMemberRemovedPayload,
  fromWs?: boolean,
) {
  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(event, 'feed-member-removed'),
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

  const { connected_user: connectedUser } = this.client.state.getLatestValue();

  this.state.next((currentState) => {
    let newState: FeedState | undefined;

    if (typeof currentState.members !== 'undefined') {
      const filtered = currentState.members.filter(
        (member) => member.user.id !== event.member_id,
      );

      if (filtered.length !== currentState.members.length) {
        newState ??= { ...currentState };
        newState.members = filtered;
      }
    }

    if (
      connectedUser?.id === event.member_id &&
      typeof currentState.own_membership !== 'undefined'
    ) {
      newState ??= { ...currentState };
      delete newState.own_membership;
    }

    return newState ?? currentState;
  });
}
