import {
  useCreateFeedsClient,
  StreamFeeds,
  FeedsClient,
} from '@stream-io/feeds-react-sdk';
import { AppSkeleton } from './AppSkeleton';
import { OwnFeedsContextProvider } from './own-feeds-context';
import { generateUsername } from 'unique-username-generator';

const API_KEY = import.meta.env.VITE_API_KEY;
const urlParams = new URLSearchParams(window.location.search);
const userIdFromUrl = urlParams.get('user_id');
const USER_ID =
  import.meta.env.VITE_USER_ID ?? userIdFromUrl ?? generateUsername('-');

// Set user_id as URL parameter if not already present
if (!userIdFromUrl) {
  urlParams.set('user_id', USER_ID);
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}?${urlParams}`,
  );
}

const CURRENT_USER = {
  id: USER_ID,
  name: import.meta.env.VITE_USER_NAME ?? USER_ID,
  token:
    (import.meta.env.VITE_USER_TOKEN ?? import.meta.env.VITE_TOKEN_URL)
      ? () =>
          fetch(`${import.meta.env.VITE_TOKEN_URL}&user_id=${USER_ID}`)
            .then((res) => res.json())
            .then((data) => data.token)
      : new FeedsClient(API_KEY).devToken(USER_ID),
};

export default function App() {
  const client = useCreateFeedsClient({
    apiKey: API_KEY,
    tokenOrProvider: CURRENT_USER.token,
    userData: {
      id: CURRENT_USER.id,
      name: CURRENT_USER.name,
    },
  });

  if (!client) {
    return null;
  }

  return (
    <StreamFeeds client={client}>
      <OwnFeedsContextProvider>
        <AppSkeleton />
      </OwnFeedsContextProvider>
    </StreamFeeds>
  );
}
