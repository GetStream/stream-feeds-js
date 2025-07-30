import { Feed } from '../../../feed';
import { EventPayload } from '../../../types-internal';

export function handleFeedMemberRemoved(
  this: Feed,
  event: EventPayload<'feeds.feed_member.removed'>,
) {
  const { connected_user: connectedUser } = this.client.state.getLatestValue();

  this.state.next((currentState) => {
    const newState = {
      ...currentState,
      members: currentState.members?.filter(
        (member) => member.user.id !== event.user?.id,
      ),
    };

    if (connectedUser?.id === event.member_id) {
      delete newState.own_membership;
    }

    return newState;
  });
}
