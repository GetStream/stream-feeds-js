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
  isLoading: boolean;
};

const FollowSuggestionsContext = createContext<FollowSuggestionsContextValue>({
  suggestedFeeds: [],
  loadFollowSuggestions: async () => { },
  isLoading: true,
});

export const FollowSuggestionsContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [suggestedFeeds, setsuggestedFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  const loadFollowSuggestions = useCallback(async () => {
    if (!client || !connectedUser) {
      setsuggestedFeeds([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await client.getFollowSuggestions({
        feed_group_id: 'user',
        limit: 3,
      });
      setsuggestedFeeds(response.feeds);
    } catch (error) {
      setsuggestedFeeds([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, connectedUser]);

  return (
    <FollowSuggestionsContext.Provider
      value={{
        suggestedFeeds,
        loadFollowSuggestions,
        isLoading,
      }}
    >
      {children}
    </FollowSuggestionsContext.Provider>
  );
};

export const useFollowSuggestionsContext = () =>
  useContext(FollowSuggestionsContext);
