import type { FeedsClientState } from '../../src/FeedsClient';
import { useStateStore } from './useStateStore';
import { useFeedsClient } from '../contexts/StreamFeedsContext';

/**
 * A React hook that returns the currently connected user on a `FeedsClient` instance and null otherwise.
 */
export const useClientConnectedUser = () => {
  const client = useFeedsClient();

  const { user } = useStateStore(client?.state, clientConnectedUserSelector) ?? {};

  return user;
};

/**
 * A React hook that returns the websocket connection state of `FeedsClient`.
 */
export const useWsConnectionState = () => {
  const client = useFeedsClient();

  return useStateStore(client?.state, wsConnectionStateSelector) ?? {};
};

const clientConnectedUserSelector = (nextState: FeedsClientState) => ({
  user: nextState.connectedUser,
});

const wsConnectionStateSelector = (nextState: FeedsClientState) => ({
  isHealthy: nextState.isWsConnectionHealthy,
});
