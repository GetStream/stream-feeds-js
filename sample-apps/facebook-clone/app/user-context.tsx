'use client';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { StreamFeedsClient } from '@stream-io/feeds-client';
import { UserRequest } from '@stream-io/common';
import * as usersJSON from '../users.json';

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
  client?: StreamFeedsClient;
  user?: UserRequest;
  logIn: (user: UserRequest) => Promise<void>;
  logOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  client: undefined,
  users: users,
  logIn: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = useState<StreamFeedsClient | undefined>();
  const [user, setUser] = useState<UserRequest | undefined>();

  const logIn = async (user: UserRequest) => {
    document.cookie = `user_id=${user.id}`;
    setUser(user);
    try {
      const tokenProvider = async () => {
        const url = new URL(tokenProviderURL);
        url.searchParams.set('api_key', apiKey);
        url.searchParams.set('user_id', user.id);

        const response = await fetch(url.toString());
        const data = await response.json();
        return data.token;
      };
      const _client = new StreamFeedsClient(apiKey, { base_url: apiUrl });
      const connectPromise = _client.connectUser(user, tokenProvider);
      setClient(_client);
      await connectPromise;
    } catch (error) {
      logOut();
      throw error;
    }
  };

  useEffect(() => {
    const user_id = getCookieValue('user_id');
    const loggedInUser = users.find((u) => u.id === user_id);
    if (loggedInUser) {
      logIn(loggedInUser);
    } else {
      document.cookie = '';
    }
  }, []);

  const logOut = () => {
    document.cookie = '';
    setUser(undefined);
    const _client = client;
    setClient(undefined);
    if (_client?.state.getLatestValue().connectedUser) {
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
