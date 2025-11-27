import type { PropsWithChildren} from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { Feed } from '@stream-io/feeds-react-native-sdk';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';
import { usePushNotifications } from '@/hooks/usePushNotifications';

type OwnFeedsContextValue = {
  ownUserFeed?: Feed;
  ownTimelineFeed?: Feed;
  ownNotificationFeed?: Feed;
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
const notificationFeedRequestConfig = {
  groupId: 'notification',
  queryOptions: {
    watch: true,
  },
};

export const OwnFeedsContextProvider = ({
  children,
}: PropsWithChildren<OwnFeedsContextValue>) => {
  const ownUserFeed = useCreateAndQueryFeed(userFeedRequestConfig);
  const ownTimelineFeed = useCreateAndQueryFeed(timelineFeedRequestConfig);
  const ownNotificationFeed = useCreateAndQueryFeed(
    notificationFeedRequestConfig,
  );

  const contextValue = useMemo(
    () => ({ ownUserFeed, ownTimelineFeed, ownNotificationFeed }),
    [ownUserFeed, ownTimelineFeed, ownNotificationFeed],
  );

  usePushNotifications();

  return (
    <OwnFeedsContext.Provider value={contextValue}>
      {children}
    </OwnFeedsContext.Provider>
  );
};

export const useOwnFeedsContext = () => useContext(OwnFeedsContext);
