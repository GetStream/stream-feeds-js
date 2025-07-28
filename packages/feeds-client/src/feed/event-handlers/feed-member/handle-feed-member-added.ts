import { Feed, FeedState } from '../../../feed';
import { EventPayload } from '../../../types-internal';

export function handleFeedMemberAdded(
  this: Feed,
  event: EventPayload<'feeds.feed_member.added'>,
) {
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
