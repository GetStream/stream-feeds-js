import type { Feed } from '../feed';
import type { UserResponseCommonFields } from '../gen/models';

export function eventTriggeredByConnectedUser(
  this: Feed,
  payload: { user?: UserResponseCommonFields },
) {
  const connectedUser = this.client.state.getLatestValue().connected_user;
  const payloadUser = payload.user ?? connectedUser;

  return (
    typeof connectedUser !== 'undefined' &&
    connectedUser?.id === payloadUser?.id
  );
}
