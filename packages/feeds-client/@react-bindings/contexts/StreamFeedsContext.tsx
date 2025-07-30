import { createContext, useContext } from 'react';
import type { FeedsClient } from '../../src/feeds-client';

export const StreamFeedsContext = createContext<FeedsClient | undefined>(undefined);

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
 * Hook to access the nearest FeedsClient instance.
 */
export const useFeedsClient = () => {
  return useContext(StreamFeedsContext);
};
