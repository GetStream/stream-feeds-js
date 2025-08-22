import { Feed, FeedState } from '../../../feed';
import { EventPayload } from '../../../types-internal';

export function handleFeedMemberRemoved(
  this: Feed,
  event: EventPayload<'feeds.feed_member.removed'>,
) {
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
