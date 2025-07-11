import { PropsWithChildren, useEffect } from 'react';
import { StreamFeeds as StreamFeedsWrapper } from '@stream-io/feeds-client/react-bindings';
import type { StreamFeedsContextProps } from '@stream-io/feeds-client/react-bindings';
import NetInfo from '@react-native-community/netinfo';

export const StreamFeeds = ({
  client,
  children,
}: PropsWithChildren<StreamFeedsContextProps>) => {
  useEffect(() => {
    let prevIsOnline = true;
    return NetInfo.addEventListener((state) => {
      const { isConnected, isInternetReachable } = state;
      const isOnline = isConnected === true && isInternetReachable !== false;
      if (isOnline === prevIsOnline) {
        return;
      }
      prevIsOnline = isOnline;
      const type = isOnline ? 'online' : 'offline';
      client.updateNetworkConnectionStatus({ type });
    });
  }, [client]);

  return <StreamFeedsWrapper client={client}>{children}</StreamFeedsWrapper>;
};
