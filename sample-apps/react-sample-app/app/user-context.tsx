'use client';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { type UserRequest } from '@stream-io/feeds-react-sdk';
import * as usersJSON from '../users.json';
import { useAppNotificationsContext } from './app-notifications-context';

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
  user?: UserRequest;
  logIn: (user: UserRequest) => void;
  logOut: () => void;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  users,
  logIn: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const { resetNotifications } = useAppNotificationsContext();
  const [user, setUser] = useState<UserRequest | undefined>();

  const logIn = (_user?: UserRequest) => {
    document.cookie = _user ? `user_id=${_user.id}` : '';
    setUser(_user);
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
    resetNotifications();
  };

  return (
    <UserContext.Provider value={{ user, users, logIn, logOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
