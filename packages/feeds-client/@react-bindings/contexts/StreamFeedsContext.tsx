import { createContext, PropsWithChildren, useContext } from 'react';
import type { FeedsClient } from '../../src/FeedsClient';

const StreamFeedsContext = createContext<FeedsClient | undefined>(undefined);

/**
 * The props for the StreamFeedsProvider component.
 */
export type StreamFeedsContextProps = {
  /**
   * The client instance to provide to the component tree.
   */
  client: FeedsClient;
};

/**
 * StreamFeedsProvider is a provider component which should be used to wrap the entire application.
 * It provides the client object to all children components.
 */
export const StreamFeedsProvider = ({
  children,
  client,
}: PropsWithChildren<StreamFeedsContextProps>) => {
  return (
    <StreamFeedsContext.Provider value={client}>
        {children}
    </StreamFeedsContext.Provider>
  );
};

/**
 * Hook to access the nearest FeedsClient instance.
 */
export const useFeedsClient = () => {
  return useContext(StreamFeedsContext);
};
