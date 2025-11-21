import {
  Feed,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

type OwnFeedsContextValue = {
  ownFeed: Feed | undefined;
  ownTimeline: Feed | undefined;
  ownNotifications: Feed | undefined;
  ownStoryTimeline: Feed | undefined;
  ownStoryFeed: Feed | undefined;
};

const OwnFeedsContext = createContext<OwnFeedsContextValue>({
  ownFeed: undefined,
  ownTimeline: undefined,
  ownNotifications: undefined,
  ownStoryTimeline: undefined,
  ownStoryFeed: undefined,
});

export const OwnFeedsContextProvider = ({ children }: PropsWithChildren) => {
  const [ownFeed, setOwnFeed] = useState<Feed | undefined>();
  const [ownTimeline, setOwnTimeline] = useState<Feed | undefined>();
  const [ownNotifications, setOwnNotifications] = useState<Feed | undefined>();
  const [ownStoryTimeline, setOwnStoryTimeline] = useState<Feed | undefined>();
  const [ownStoryFeed, setOwnStoryFeed] = useState<Feed | undefined>();
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  useEffect(() => {
    if (!connectedUser || !client) {
      setOwnFeed(undefined);
      setOwnTimeline(undefined);
      setOwnNotifications(undefined);
      setOwnStoryTimeline(undefined);
      setOwnStoryFeed(undefined);
    } else {
      const _ownFeed = client.feed('user', connectedUser.id);
      setOwnFeed(_ownFeed);
      const _ownTimeline = client.feed('timeline', connectedUser.id, {
        // Social media apps usually don't add new activities from WebSocket
        // users need to pull to refresh
        activityAddedEventFilter: (event) => {
          return event.activity.user?.id === connectedUser.id;
        },
      });
      setOwnTimeline(_ownTimeline);
      const ownFeedRequest = _ownFeed?.getOrCreate({
        watch: true,
      });
      const ownTimelineRequest = _ownTimeline?.getOrCreate({
        watch: true,
      });
      // You typically create these relationships on your server-side, we do this here for simplicity
      Promise.all([ownFeedRequest, ownTimelineRequest]).then(() => {
        const alreadyFollows = _ownFeed.currentState.own_follows?.find(
          (follow) => follow.source_feed.feed === _ownTimeline.feed,
        );
        if (!alreadyFollows) {
          client.follow({
            source: _ownTimeline.feed,
            target: _ownFeed.feed,
          });
        }
      });
      const _ownNotifications = client.feed('notification', connectedUser.id);
      setOwnNotifications(_ownNotifications);
      _ownNotifications?.getOrCreate({ watch: true });
      const _ownStoryTimeline = client.feed('stories', connectedUser.id);
      setOwnStoryTimeline(_ownStoryTimeline);
      _ownStoryTimeline?.getOrCreate({ watch: true });
      const _ownStoryFeed = client.feed('story', connectedUser.id, {
        addNewActivitiesTo: 'end',
      });
      setOwnStoryFeed(_ownStoryFeed);
      _ownStoryFeed?.getOrCreate({ watch: true, limit: 100 });
    }
  }, [connectedUser, client]);

  return (
    <OwnFeedsContext.Provider
      value={{
        ownFeed,
        ownTimeline,
        ownNotifications,
        ownStoryTimeline,
        ownStoryFeed,
      }}
    >
      {children}
    </OwnFeedsContext.Provider>
  );
};

export const useOwnFeedsContext = () => useContext(OwnFeedsContext);
