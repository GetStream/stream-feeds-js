'use client';
import { StreamFlatFeedClient } from '@stream-io/feeds-client';
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
};

const FeedContext = createContext<FeedContextValue>({
  ownFeed: undefined,
  ownTimeline: undefined,
});

export const FeedContextProvider = ({ children }: PropsWithChildren) => {
  const [ownFeed, setOwnFeed] = useState<StreamFlatFeedClient | undefined>();
  const [ownTimeline, setOwnTimeline] = useState<
    StreamFlatFeedClient | undefined
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
      setOwnFeed(_ownFeed);
      setOwnTimeline(_ownTimeline);
    }
  }, [user, client]);

  return (
    <FeedContext.Provider value={{ ownFeed, ownTimeline }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = () => useContext(FeedContext);
