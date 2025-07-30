import { createContext, useContext } from 'react';
import type { Feed } from '../../src/feed';

export const StreamFeedContext = createContext<Feed | undefined>(undefined);

/**
 * The props for the StreamFeedProvider component.
 */
export type StreamFeedContextProps = {
  feed: Feed;
};

/**
 * Hook to access the nearest Feed instance.
 */
export const useFeedContext = () => {
  return useContext(StreamFeedContext);
};
