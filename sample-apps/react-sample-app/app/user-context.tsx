'use client';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { FeedsClient, type UserRequest } from '@stream-io/feeds-react-sdk';
import * as usersJSON from '../users.json';
import { useRouter } from 'next/navigation';
import { useAppNotificationsContext } from './app-notifications-context';

const tokenProviderURL = process.env.NEXT_PUBLIC_STREAM_TOKEN_URL!;
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

const getCookieValue = (cookieName: string) => {
  // Split document.cookie into individual "key=value" strings
  const cookies = document.cookie.split('; ');

  // Find the cookie with the matching name
  for (const cookie of cookies) {
    // Split each "key=value" string into key and value
    const [key, value] = cookie.split('=');
    if (key === cookieName) {
      // Return the decoded value if the key matches
      return decodeURIComponent(value);
    }
  }

  // Return null if the cookie is not found
  return null;
};

const users = Array.from(usersJSON);

type UserContextValue = {
  users: UserRequest[];
  client?: FeedsClient;
  user?: UserRequest;
  logIn: (user: UserRequest) => Promise<void>;
  logOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  client: undefined,
  users,
  logIn: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { resetNotifications } = useAppNotificationsContext();
  const [client, setClient] = useState<FeedsClient | undefined>();
  const [user, setUser] = useState<UserRequest | undefined>();

  const logIn = async (user: UserRequest) => {
    document.cookie = `user_id=${user.id}`;
    setUser(user);
    try {
      const tokenProvider = async () => {
        const response = await fetch('/api/create-token');
        if (!response.ok) {
          throw new Error(`Failed to get token: ${response.status}`);
        }
        const data = await response.json();
        return data.token;
      };
      const _client = new FeedsClient(apiKey, { base_url: apiUrl });
      const connectPromise = _client.connectUser(user, tokenProvider);
      setClient(_client);
      // @ts-expect-error Exposing the client to globalThis for debugging purposes
      globalThis.client = _client;
      await connectPromise;
    } catch (error) {
      logOut().catch((err) => {
        throw err;
      });
      throw error;
    }
  };

  useEffect(() => {
    const user_id = getCookieValue('user_id');
    const loggedInUser = users.find((u) => u.id === user_id);
    if (loggedInUser) {
      logIn(loggedInUser).catch((err) => {
        document.cookie = '';
        console.warn(`Failed to login with user from cookie: ${user_id}`, err);
        router.push('/login');
      });
    } else {
      document.cookie = '';
    }
  }, []);

  const logOut = () => {
    document.cookie = '';
    setUser(undefined);
    const _client = client;
    setClient(undefined);
    resetNotifications();
    if (_client?.state.getLatestValue().connected_user) {
      return _client.disconnectUser();
    } else {
      return Promise.resolve();
    }
  };

  return (
    <UserContext.Provider value={{ client, user, users, logIn, logOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
