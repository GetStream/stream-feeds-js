import {
  type PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useState,
} from 'react';
import {
  type FeedSuggestionResponse,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';

type FollowSuggestionsContextValue = {
  suggestions: FeedSuggestionResponse[];
  loadSuggestions: () => Promise<void>;
};

const FollowSuggestionsContext = createContext<FollowSuggestionsContextValue>({
  suggestions: [],
  loadSuggestions: async () => {},
});

export const FollowSuggestionsContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [suggestions, setSuggestions] = useState<FeedSuggestionResponse[]>([]);
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  const loadSuggestions = useCallback(async () => {
    if (!client || !connectedUser) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await client.getFollowSuggestions({
        feed_group_id: 'user',
        limit: 3,
      });
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Failed to load follow suggestions:', error);
      setSuggestions([]);
    }
  }, [client, connectedUser]);

  return (
    <FollowSuggestionsContext.Provider
      value={{
        suggestions,
        loadSuggestions,
      }}
    >
      {children}
    </FollowSuggestionsContext.Provider>
  );
};

export const useFollowSuggestionsContext = () =>
  useContext(FollowSuggestionsContext);
