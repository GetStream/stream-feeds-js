import type { EventPayload } from '../../../types-internal';
import type { FeedsClient, FeedsClientState } from '../../feeds-client';

export function handleUserUpdated(
  this: FeedsClient,
  event: EventPayload<'user.updated'>,
) {
  this.state.next((currentState) => {
    let newState: FeedsClientState | undefined;

    const { connected_user } = currentState;

    if (connected_user && connected_user.id === event.user.id) {
      newState ??= {
        ...currentState,
      };

      newState.connected_user = {
        ...connected_user,
        ...event.user,
      };
    }

    // TODO: update other users in user map (if/once applicable)

    return newState ?? currentState;
  });
}
