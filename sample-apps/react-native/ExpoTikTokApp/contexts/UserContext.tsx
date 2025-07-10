'use client';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserRequest } from '@stream-io/feeds-react-native-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextValue = {
  user: UserRequest | null;
  userLoaded: boolean;
  logIn: (user: UserRequest) => Promise<void>;
  logOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  userLoaded: false,
  logIn: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [cachedUser, setCachedUser] = useState<UserRequest | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const fetchUserFromStorage = async () => {
      const storedUser = await AsyncStorage.getItem('@stream-io/login-config');
      if (storedUser) {
        setCachedUser(JSON.parse(storedUser));
      }
      setUserLoaded(true);
    }
    fetchUserFromStorage();
  }, []);

  const logIn = async (user: UserRequest) => {
    await AsyncStorage.setItem('@stream-io/login-config', JSON.stringify(user));
    setCachedUser(user);
  };

  const logOut = async () => {
    await AsyncStorage.removeItem('@stream-io/login-config');
    setCachedUser(null);
  };

  return (
    <UserContext.Provider value={{ user: cachedUser, userLoaded, logIn, logOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
