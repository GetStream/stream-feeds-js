import { useStateStore } from '@stream-io/state-store/react-bindings';

import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import type { FeedsClientState } from '../../../../feeds-client';

/**
 * A React hook that returns the websocket connection state of `FeedsClient`.
 */
export const useWsConnectionState = () => {
  const client = useFeedsClient();

  const { is_healthy } = useStateStore(client?.state, selector) ?? {}

  return { is_healthy };
};

const selector = (nextState: FeedsClientState) => ({
  is_healthy: nextState.is_ws_connection_healthy,
});
