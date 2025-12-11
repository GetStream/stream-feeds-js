import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import type { FeedsClientState } from '../../../../feeds-client';

/**
 * A React hook that returns the currently connected user on a `FeedsClient` instance and null otherwise.
 */
export const useClientConnectedUser = () => {
  const client = useFeedsClient();

  const { user } = useStateStore(client?.state, selector) ?? {};

  return user;
};

const selector = (nextState: FeedsClientState) => ({
  user: nextState.connected_user,
});
