'use client';

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  type Feed,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';

type OwnFeedsErrors = {
  ownFeed: Error | undefined;
  ownTimeline: Error | undefined;
  ownNotifications: Error | undefined;
  ownStoryTimeline: Error | undefined;
  ownStoryFeed: Error | undefined;
  ownForyouFeed: Error | undefined;
};

type OwnFeedsContextValue = {
  ownFeed: Feed | undefined;
  ownTimeline: Feed | undefined;
  ownNotifications: Feed | undefined;
  ownStoryTimeline: Feed | undefined;
  ownStoryFeed: Feed | undefined;
  ownForyouFeed: Feed | undefined;
  errors: OwnFeedsErrors;
  reloadTimelines: () => Promise<void>;
};

const defaultErrors: OwnFeedsErrors = {
  ownFeed: undefined,
  ownTimeline: undefined,
  ownNotifications: undefined,
  ownStoryTimeline: undefined,
  ownStoryFeed: undefined,
  ownForyouFeed: undefined,
};

const OwnFeedsContext = createContext<OwnFeedsContextValue>({
  ownFeed: undefined,
  ownTimeline: undefined,
  ownNotifications: undefined,
  ownStoryTimeline: undefined,
  ownStoryFeed: undefined,
  ownForyouFeed: undefined,
  errors: defaultErrors,
  reloadTimelines: () => Promise.resolve(),
});

export const OwnFeedsContextProvider = ({ children }: PropsWithChildren) => {
  const [ownFeed, setOwnFeed] = useState<Feed | undefined>();
  const [ownTimeline, setOwnTimeline] = useState<Feed | undefined>();
  const [ownNotifications, setOwnNotifications] = useState<Feed | undefined>();
  const [ownStoryTimeline, setOwnStoryTimeline] = useState<Feed | undefined>();
  const [ownStoryFeed, setOwnStoryFeed] = useState<Feed | undefined>();
  const [ownForyouFeed, setOwnForyouFeed] = useState<Feed | undefined>();
  const [errors, setErrors] = useState<OwnFeedsErrors>(defaultErrors);
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  useEffect(() => {
    if (!connectedUser || !client) {
      setOwnFeed(undefined);
      setOwnTimeline(undefined);
      setOwnNotifications(undefined);
      setOwnStoryTimeline(undefined);
      setOwnStoryFeed(undefined);
      setOwnForyouFeed(undefined);
      setErrors(defaultErrors);
    } else {
      const feed = client.feed('user', connectedUser.id);
      setOwnFeed(feed);
      const timeline = client.feed('timeline', connectedUser.id, {
        // Social media apps usually don't add new activities from WebSocket
        // users need to pull to refresh
        activityAddedEventFilter: (event) => {
          return event.activity.user?.id === connectedUser.id;
        },
      });
      setOwnTimeline(timeline);
      const feedRequest = feed
        ?.getOrCreate({
          watch: true,
        })
        .catch((error: Error) => {
          setErrors((prev) => ({ ...prev, ownFeed: error }));
        });
      const timelineRequest = timeline
        ?.getOrCreate({
          watch: true,
          limit: 10,
        })
        .catch((error: Error) => {
          setErrors((prev) => ({ ...prev, ownTimeline: error }));
        });
      // You typically create these relationships on your server-side, we do this here for simplicity
      Promise.all([feedRequest, timelineRequest]).then(() => {
        const alreadyFollows = feed.currentState.own_follows?.find(
          (follow) => follow.source_feed.feed === timeline.feed,
        );
        if (!alreadyFollows) {
          timeline.follow(feed);
        }
      });
      const notifications = client.feed('notification', connectedUser.id);
      setOwnNotifications(notifications);
      notifications?.getOrCreate({ watch: true }).catch((error: Error) => {
        setErrors((prev) => ({ ...prev, ownNotifications: error }));
      });
      // For stories feed there is no WebSocket event for new stories, so we don't need activityAddedEventFilter
      const storyTimeline = client.feed('stories', connectedUser.id);
      setOwnStoryTimeline(storyTimeline);
      storyTimeline?.getOrCreate({ watch: true }).catch((error: Error) => {
        setErrors((prev) => ({ ...prev, ownStoryTimeline: error }));
      });
      const storyFeed = client.feed('story', connectedUser.id, {
        // In a regular feed, latest activites from WebSocket are added to start of the list
        // but we want stories to be ordered chronologically, so we add them to the end of the list
        addNewActivitiesTo: 'end',
      });
      setOwnStoryFeed(storyFeed);
      storyFeed
        ?.getOrCreate({ watch: true, limit: 100 })
        .catch((error: Error) => {
          setErrors((prev) => ({ ...prev, ownStoryFeed: error }));
        });
      const forYouFeed = client.feed('foryou', connectedUser.id);
      setOwnForyouFeed(forYouFeed);
      forYouFeed?.getOrCreate({ limit: 10 }).catch((error: Error) => {
        setErrors((prev) => ({ ...prev, ownForyouFeed: error }));
      });
    }
  }, [connectedUser, client]);

  const reloadTimelines = useCallback(async () => {
    setErrors((prev) => ({
      ...prev,
      ownTimeline: undefined,
      ownStoryTimeline: undefined,
    }));

    await Promise.all([
      ownTimeline?.getOrCreate({ watch: true, limit: 10 }).catch((error: Error) => {
        setErrors((prev) => ({ ...prev, ownTimeline: error }));
      }),
      ownStoryTimeline?.getOrCreate({ watch: true }).catch((error: Error) => {
        setErrors((prev) => ({ ...prev, ownStoryTimeline: error }));
      }),
    ]);
  }, [ownTimeline, ownStoryTimeline]);

  return (
    <OwnFeedsContext.Provider
      value={{
        ownFeed,
        ownTimeline,
        ownNotifications,
        ownStoryTimeline,
        ownStoryFeed,
        ownForyouFeed,
        errors,
        reloadTimelines,
      }}
    >
      {children}
    </OwnFeedsContext.Provider>
  );
};

export const useOwnFeedsContext = () => useContext(OwnFeedsContext);
