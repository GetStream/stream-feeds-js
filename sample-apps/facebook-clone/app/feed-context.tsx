'use client';
import {
  StreamFlatFeedClient,
  StreamNotificationFeedClient,
} from '@stream-io/feeds-client';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useUserContext } from './user-context';

type FeedContextValue = {
  ownFeed: StreamFlatFeedClient | undefined;
  ownTimeline: StreamFlatFeedClient | undefined;
  ownNotifications: StreamNotificationFeedClient | undefined;
};

const FeedContext = createContext<FeedContextValue>({
  ownFeed: undefined,
  ownTimeline: undefined,
  ownNotifications: undefined,
});

export const FeedContextProvider = ({ children }: PropsWithChildren) => {
  const [ownFeed, setOwnFeed] = useState<StreamFlatFeedClient | undefined>();
  const [ownTimeline, setOwnTimeline] = useState<
    StreamFlatFeedClient | undefined
  >();
  const [ownNotifications, setOwnNotifications] = useState<
    StreamNotificationFeedClient | undefined
  >();
  const { user, client } = useUserContext();

  useEffect(() => {
    if (!user || !client) {
      setOwnFeed(undefined);
      setOwnTimeline(undefined);
    } else {
      void client
        .queryFeeds({
          watch: true,
          filter: {
            feed_id: user.id,
            feed_group: { $in: ['user', 'timeline', 'notification'] },
          },
        })
        .then((response) => {
          response.feeds.forEach((f) => {
            if (f.type === 'notification') {
              setOwnNotifications(f);
            } else {
              switch (f.state.getLatestValue().group) {
                case 'user':
                  setOwnFeed(f);
                  break;
                case 'timeline':
                  setOwnTimeline(f);
                  break;
              }
            }
            void f.read({ offset: 0, limit: 30 });
          });
        });
    }
  }, [user, client]);

  return (
    <FeedContext.Provider value={{ ownFeed, ownTimeline, ownNotifications }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = () => useContext(FeedContext);
