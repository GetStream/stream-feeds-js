'use client';

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useState,
} from 'react';
import {
  type Feed,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';

type FollowSuggestionsContextValue = {
  suggestedFeeds: Feed[];
  loadFollowSuggestions: () => Promise<void>;
};

const FollowSuggestionsContext = createContext<FollowSuggestionsContextValue>({
  suggestedFeeds: [],
  loadFollowSuggestions: async () => { },
});

export const FollowSuggestionsContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [suggestedFeeds, setsuggestedFeeds] = useState<Feed[]>([]);
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  const loadFollowSuggestions = useCallback(async () => {
    if (!client || !connectedUser) {
      setsuggestedFeeds([]);
      return;
    }

    try {
      const response = await client.getFollowSuggestions({
        feed_group_id: 'user',
        limit: 3,
      });
      setsuggestedFeeds(response.feeds);
    } catch (error) {
      setsuggestedFeeds([]);
      throw error;
    }
  }, [client, connectedUser]);

  return (
    <FollowSuggestionsContext.Provider
      value={{
        suggestedFeeds,
        loadFollowSuggestions,
      }}
    >
      {children}
    </FollowSuggestionsContext.Provider>
  );
};

export const useFollowSuggestionsContext = () =>
  useContext(FollowSuggestionsContext);
