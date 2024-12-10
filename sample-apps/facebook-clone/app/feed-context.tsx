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
      const _ownFeed = client.feed('user', user.id);
      _ownFeed.getOrCreate({ watch: true }).catch((err) => {
        throw err;
      });
      _ownFeed.read({ offset: 0, limit: 30 }).catch((err) => {
        throw err;
      });
      const _ownTimeline = client.feed('timeline', user.id);
      _ownTimeline.getOrCreate({ watch: true }).catch((err) => {
        throw err;
      });
      _ownTimeline.read({ offset: 0, limit: 30 }).catch((err) => {
        throw err;
      });
      const _ownNotifications = client.notificationFeed(
        'notification',
        user.id,
      );
      _ownNotifications
        .getOrCreate({ watch: true })
        .then(() => {
          _ownNotifications.read({ offset: 0, limit: 30 }).catch((err) => {
            throw err;
          });
        })
        .catch((err) => {
          throw err;
        });
      setOwnFeed(_ownFeed);
      setOwnTimeline(_ownTimeline);
      setOwnNotifications(_ownNotifications);
    }
  }, [user, client]);

  return (
    <FeedContext.Provider value={{ ownFeed, ownTimeline, ownNotifications }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = () => useContext(FeedContext);
