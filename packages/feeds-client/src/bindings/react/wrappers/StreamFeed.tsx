import type { PropsWithChildren } from 'react';
import { StreamFeedContext } from '../contexts/StreamFeedContext';
import type { Feed } from '@self';

/**
 * The props for the StreamFeed component. It accepts a `Feed` instance.
 */
export type StreamFeedProps = {
  feed: Feed;
};

export const StreamFeed = ({
  feed,
  children,
}: PropsWithChildren<StreamFeedProps>) => {
  return (
    <StreamFeedContext.Provider value={feed}>
      {children}
    </StreamFeedContext.Provider>
  );
};

StreamFeed.displayName = 'StreamFeed';
