'use client';
import {
  useClientConnectedUser,
  useFeedsClient,
  type Feed,
} from '@stream-io/feeds-react-sdk';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useErrorContext } from './error-context';

type OwnFeedsContextValue = {
  ownFeed: Feed | undefined;
  ownTimeline: Feed | undefined;
  ownNotifications: Feed | undefined;
};

const OwnFeedsContext = createContext<OwnFeedsContextValue>({
  ownFeed: undefined,
  ownTimeline: undefined,
  ownNotifications: undefined,
});

export const OwnFeedsContextProvider = ({ children }: PropsWithChildren) => {
  const [ownFeed, setOwnFeed] = useState<Feed | undefined>();
  const [ownTimeline, setOwnTimeline] = useState<Feed | undefined>();
  const [ownNotifications, setOwnNotifications] = useState<Feed | undefined>();
  const client = useFeedsClient();
  const user = useClientConnectedUser();
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
    <OwnFeedsContext.Provider
      value={{ ownFeed, ownTimeline, ownNotifications }}
    >
      {children}
    </OwnFeedsContext.Provider>
  );
};

export const useOwnFeedsContext = () => useContext(OwnFeedsContext);
