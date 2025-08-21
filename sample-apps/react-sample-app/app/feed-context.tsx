'use client';
import type { Feed } from '@stream-io/feeds-react-sdk';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useUserContext } from './user-context';
import { useErrorContext } from './error-context';

type FeedContextValue = {
  ownFeed: Feed | undefined;
  ownTimeline: Feed | undefined;
  ownNotifications: Feed | undefined;
};

const FeedContext = createContext<FeedContextValue>({
  ownFeed: undefined,
  ownTimeline: undefined,
  ownNotifications: undefined,
});

export const FeedContextProvider = ({ children }: PropsWithChildren) => {
  const [ownFeed, setOwnFeed] = useState<Feed | undefined>();
  const [ownTimeline, setOwnTimeline] = useState<Feed | undefined>();
  const [ownNotifications, setOwnNotifications] = useState<Feed | undefined>();
  const { user, client } = useUserContext();
  const { throwUnrecoverableError } = useErrorContext();

  useEffect(() => {
    if (!user || !client) {
      setOwnFeed(undefined);
      setOwnTimeline(undefined);
    } else {
      const _ownFeed = client.feed('user', user.id);
      setOwnFeed(_ownFeed);
      const _ownTimeline = client.feed('timeline', user.id);
      setOwnTimeline(_ownTimeline);
      _ownFeed
        ?.getOrCreate({ watch: true, followers_pagination: { limit: 30 } })
        .catch(throwUnrecoverableError);
      _ownTimeline
        ?.getOrCreate({
          watch: true,
          following_pagination: { limit: 30 },
        })
        .catch(throwUnrecoverableError);
      const _ownNotifications = client.feed('notification', user.id);
      setOwnNotifications(_ownNotifications);
      _ownNotifications
        ?.getOrCreate({ watch: true })
        .catch(throwUnrecoverableError);
    }
  }, [user, client]);

  return (
    <FeedContext.Provider value={{ ownFeed, ownTimeline, ownNotifications }}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = () => useContext(FeedContext);
