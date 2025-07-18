import type { FeedsClientState } from '../../../src/FeedsClient';
import { useStateStore } from '../useStateStore';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';

/**
 * A React hook that returns the websocket connection state of `FeedsClient`.
 */
export const useWsConnectionState = () => {
  const client = useFeedsClient();

  const { isHealthy } = useStateStore(client?.state, selector) ?? {}

  return { isHealthy };
};

const selector = (nextState: FeedsClientState) => ({
  isHealthy: nextState.isWsConnectionHealthy,
});
