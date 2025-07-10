import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import 'react-native-reanimated';
import {
  useCreateFeedsClient,
  StreamFeeds,
} from '@stream-io/feeds-react-native-sdk';
import type { UserRequest } from '@stream-io/feeds-react-native-sdk';
import LoginScreen from '@/app/LoginScreen';

import { useColorScheme } from '@/components/useColorScheme';
import { UserContextProvider, useUserContext } from '@/contexts/UserContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <UserContextProvider>
      <RootLayout />
    </UserContextProvider>
  );
}

const RootLayout = () => {
  const { userLoaded, user } = useUserContext();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && userLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, userLoaded]);

  if (!loaded) {
    return null;
  }

  if (userLoaded && !user) {
    return <LoginScreen />;
  }

  if (!user) {
    return null;
  }

  return <RootLayoutNav user={user as UserRequest} />;
};

const apiKey = '892s22ypvt6m';
const apiUrl = 'http://localhost:3030';

const tokenProviderFactory = (userId: string) => async () => {
  const tokenGeneratorUrl = new URL('https://pronto-staging.getstream.io/api/auth/create-token?environment=feeds-v3');
  tokenGeneratorUrl.searchParams.set('api_key', apiKey);
  tokenGeneratorUrl.searchParams.set('user_id', userId);
  const response = await fetch(tokenGeneratorUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.status}`);
  }
  const data = await response.json();
  return data.token;
};

const CLIENT_OPTIONS = {
  base_url: apiUrl,
};

const RootLayoutNav = ({ user }: { user: UserRequest }) => {
  const colorScheme = useColorScheme();

  const tokenProvider = useCallback(() => {
    const provider = tokenProviderFactory(user.id);
    return provider();
  }, [user.id]);

  const client = useCreateFeedsClient({
    userData: user,
    tokenOrProvider: tokenProvider,
    options: CLIENT_OPTIONS,
    apiKey,
  });

  if (!client) {
    return null;
  }

  return (
    <StreamFeeds client={client}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </StreamFeeds>
  );
};
