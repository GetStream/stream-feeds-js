import type { PropsWithChildren } from 'react';
import { StreamFeedsContext } from '../contexts/StreamFeedsContext';
import type { StreamFeedsContextProps } from '../contexts/StreamFeedsContext';

export const StreamFeeds = ({ client, children }: PropsWithChildren<StreamFeedsContextProps>) => {
  return (
    <StreamFeedsContext.Provider value={client}>
      {children}
    </StreamFeedsContext.Provider>
  );
};

StreamFeeds.displayName = 'StreamFeeds';
