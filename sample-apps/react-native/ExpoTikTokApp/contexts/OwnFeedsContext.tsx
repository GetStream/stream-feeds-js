import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { Feed } from '@stream-io/feeds-react-native-sdk';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';

type OwnFeedsContextValue = {
  ownUserFeed?: Feed;
  ownTimelineFeed?: Feed;
};

const OwnFeedsContext = createContext<OwnFeedsContextValue>({});

const userFeedRequestConfig = {
  groupId: 'user',
  queryOptions: {
    watch: true,
  },
};
const timelineFeedRequestConfig = {
  groupId: 'timeline',
  queryOptions: {
    watch: true,
  },
};

export const OwnFeedsContextProvider = ({
  children,
}: PropsWithChildren<OwnFeedsContextValue>) => {
  const ownUserFeed = useCreateAndQueryFeed(userFeedRequestConfig);
  const ownTimelineFeed = useCreateAndQueryFeed(timelineFeedRequestConfig);

  const contextValue = useMemo(() => ({ ownUserFeed, ownTimelineFeed }), [ownUserFeed, ownTimelineFeed]);
  return (
    <OwnFeedsContext.Provider value={contextValue}>
      {children}
    </OwnFeedsContext.Provider>
  );
};

export const useOwnFeedsContext = () => useContext(OwnFeedsContext);
