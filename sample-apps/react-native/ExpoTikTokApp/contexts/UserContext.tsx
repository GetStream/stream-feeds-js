import type {
  PropsWithChildren} from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { UserRequest } from '@stream-io/feeds-react-native-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocalUser = Pick<UserRequest, 'id' | 'name' | 'image'> & { token?: string };

type UserContextValue = {
  user: LocalUser | null;
  userLoaded: boolean;
  logIn: (user: LocalUser) => Promise<void>;
  logOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  userLoaded: false,
  logIn: () => Promise.resolve(),
  logOut: () => Promise.resolve(),
});

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [cachedUser, setCachedUser] = useState<LocalUser | null>(null);
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

  const logIn = async (user: LocalUser) => {
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
