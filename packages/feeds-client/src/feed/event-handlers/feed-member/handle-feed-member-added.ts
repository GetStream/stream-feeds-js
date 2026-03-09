import type { Feed, FeedState } from '../../../feed';
import type { EventPayload, PartializeAllBut } from '../../../types-internal';
import { getStateUpdateQueueId, shouldUpdateState } from '../../../utils';
import { eventTriggeredByConnectedUser } from '../../../utils/event-triggered-by-connected-user';

export type FeedMemberAddedPayload = PartializeAllBut<
  EventPayload<'feeds.feed_member.added'>,
  'member'
>;

export function handleFeedMemberAdded(
  this: Feed,
  event: FeedMemberAddedPayload,
  fromWs?: boolean,
) {
  if (
    !shouldUpdateState({
      stateUpdateQueueId: getStateUpdateQueueId(event, 'feed-member-added'),
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
      newState ??= {
        ...currentState,
      };

      newState.members = [event.member, ...currentState.members];
    }

    if (connectedUser?.id === event.member.user.id) {
      newState ??= {
        ...currentState,
      };

      newState.own_membership = event.member;
    }

    return newState ?? currentState;
  });
}
