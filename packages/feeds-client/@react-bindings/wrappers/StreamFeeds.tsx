import { PropsWithChildren } from 'react';
import { StreamFeedsProvider } from '../contexts/StreamFeedsContext';
import type { StreamFeedsContextProps } from '../contexts/StreamFeedsContext';

export const StreamFeeds = (props: PropsWithChildren<StreamFeedsContextProps>) => {
  return (
    <StreamFeedsProvider {...props} />
  );
};

StreamFeeds.displayName = 'StreamFeeds';
