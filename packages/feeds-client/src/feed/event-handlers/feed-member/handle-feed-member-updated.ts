import type { Feed, FeedState } from '../../../feed';
import type { EventPayload } from '../../../types-internal';

export function handleFeedMemberUpdated(
  this: Feed,
  event: EventPayload<'feeds.feed_member.updated'>,
) {
  const { connected_user: connectedUser } = this.client.state.getLatestValue();

  this.state.next((currentState) => {
    const memberIndex =
      currentState.members?.findIndex(
        (member) => member.user.id === event.member.user.id,
      ) ?? -1;

    let newState: FeedState | undefined;

    if (memberIndex !== -1) {
      // if there's an index, there's a member to update
      const newMembers = [...currentState.members!];
      newMembers[memberIndex] = event.member;

      newState ??= {
        ...currentState,
      };

      newState.members = newMembers;
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
