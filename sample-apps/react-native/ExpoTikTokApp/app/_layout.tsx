import { View, Text } from '@/components/common/Themed';
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
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { StreamFeeds } from '@stream-io/feeds-react-native-sdk';
import LoginScreen from '@/components/LoginScreen';

import {
  LocalUser,
  UserContextProvider,
  useUserContext,
} from '@/contexts/UserContext';
import { useCreateClient } from '@/hooks/useCreateClient';
import { ErrorBoundary as InternalErrorBoundary } from '@/components/common/ErrorBoundary';
import { OwnFeedsContextProvider } from '@/contexts/OwnFeedsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationBackButton } from '@/components/buttons';

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

const RootLayoutNav = ({ user }: { user: LocalUser }) => {
  const colorScheme = useColorScheme();

  const client = useCreateClient(user);

  if (!client) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StreamFeeds client={client}>
        <OwnFeedsContextProvider>
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false, freezeOnBlur: true }}
              />
              <Stack.Screen
                name="activity-pager-screen"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="user-profile-screen"
                options={{
                  title: 'Profile',
                }}
              />
              <Stack.Screen
                name="hashtag-screen"
                options={{
                  title: 'Hashtags',
                  headerLeft: () => <NavigationBackButton />,
                }}
              />
              <Stack.Screen
                name="location-map-screen"
                options={{ title: 'Location' }}
              />
              <Stack.Screen
                name="(post-creation)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(notifications)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="followers-modal"
                options={{
                  title: 'Followers',
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="following-modal"
                options={{
                  title: 'Following',
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="comments-modal"
                options={{
                  title: 'Comments',
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="overlay/sheet"
                options={{
                  presentation: 'transparentModal',
                  animation: 'none',
                  headerShown: false,
                }}
              />
            </Stack>
          </ThemeProvider>
        </OwnFeedsContextProvider>
      </StreamFeeds>
    </GestureHandlerRootView>
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
