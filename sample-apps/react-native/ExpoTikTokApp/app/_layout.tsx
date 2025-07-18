import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import 'react-native-reanimated';
import { StreamFeeds } from '@stream-io/feeds-react-native-sdk';
import type { UserRequest } from '@stream-io/feeds-react-native-sdk';
import LoginScreen from '@/components/LoginScreen';

import { useColorScheme } from '@/components/useColorScheme';
import { UserContextProvider, useUserContext } from '@/contexts/UserContext';
import { useCreateClient } from '@/hooks/useCreateClient';
import { ErrorBoundary as InternalErrorBoundary } from '@/components/ErrorBoundary';
import { View } from 'react-native';

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

  return <RootLayoutNav user={user} />;
};

const RootLayoutNav = ({ user }: { user: UserRequest }) => {
  const colorScheme = useColorScheme();

  const client = useCreateClient(user);

  if (!client) {
    return null;
  }

  return (
      <StreamFeeds client={client}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="timeline-activity-screen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="create-post-modal"
              options={{
                title: 'New Post',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </ThemeProvider>
      </StreamFeeds>
  );
};

const App = () => (
  <InternalErrorBoundary
    fallback={
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Something went wrong.</Text>
      </View>
    }
  >
    <UserContextProvider>
      <RootLayout />
    </UserContextProvider>
  </InternalErrorBoundary>
);

export default App;
