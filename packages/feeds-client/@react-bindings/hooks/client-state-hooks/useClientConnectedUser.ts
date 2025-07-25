import type { FeedsClientState } from '../../../src/FeedsClient';
import { useStateStore } from '../useStateStore';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';

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
