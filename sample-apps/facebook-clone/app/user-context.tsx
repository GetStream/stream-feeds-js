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

const tokenProviderURL = process.env.NEXT_PUBLIC_STREAM_TOKEN_URL!;
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

const users: UserRequest[] = [
  {
    id: 'alice',
    name: 'Alice',
    image: 'https://randomuser.me/api/portraits/women/47.jpg',
  },
  {
    id: 'mark',
    name: 'Mark',
    image: 'https://randomuser.me/api/portraits/men/38.jpg',
  },
  {
    id: 'bob',
    name: 'Bob',
    image: 'https://randomuser.me/api/portraits/men/42.jpg',
  },
  {
    id: 'jane',
    name: 'Jane',
    image: 'https://randomuser.me/api/portraits/women/60.jpg',
  },
  {
    id: 'tamara',
    name: 'Tamara',
    image: 'https://randomuser.me/api/portraits/women/40.jpg',
  },
  {
    id: 'john',
    name: 'John',
    image: 'https://randomuser.me/api/portraits/men/54.jpg',
  },
];

type UserContextValue = {
  users: UserRequest[];
  client: StreamFeedsClient;
  user?: UserRequest;
  logIn: (user: UserRequest) => Promise<void>;
  logOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  client: new StreamFeedsClient(apiKey, { base_url: apiUrl }),
  users: users,
  logIn: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const client = new StreamFeedsClient(apiKey, { base_url: apiUrl });

  const [user, setUser] = useState<UserRequest | undefined>();

  const logIn = async (user: UserRequest) => {
    localStorage.setItem('USER_ID', user.id);
    setUser(user);
    try {
      await client.connectUser(user, async () => {
        const url = new URL(tokenProviderURL);
        url.searchParams.set('api_key', apiKey);
        url.searchParams.set('user_id', user.id);

        const response = await fetch(url.toString());
        const data = await response.json();
        return data.token;
      });
    } catch (error) {
      logOut();
      throw error;
    }
  };

  const logOut = () => {
    localStorage.removeItem('USER_ID');
    setUser(undefined);
    if (client.state.getLatestValue().connectedUser) {
      return client.disconnectUser();
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
