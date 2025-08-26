import type { ExpoConfig } from 'expo/config';

const MAPS_KEY = process.env.EXPO_PUBLIC_MAPS_API_KEY ?? '';

const config: ExpoConfig = {
  name: 'ExpoTikTokApp',
  slug: 'ExpoTikTokApp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  notification: {
    icon: './assets/images/adaptive-foreground.png',
    color: '#2063F6'
  },
  scheme: 'expotiktokapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    icon: './assets/images/icon.png',
    entitlements: { 'aps-environment': 'development' },
    infoPlist: { UIBackgroundModes: ['remote-notification'] },
    googleServicesFile: './firebase/GoogleService-Info.plist',
    supportsTablet: true,
    bundleIdentifier: 'io.getstream.expotiktokapp',
    appleTeamId: 'EHV7XZLAHA',
    config: {
      googleMapsApiKey: MAPS_KEY,
    },
  },
  android: {
    googleServicesFile: './firebase/google-services.json',
    icon: './assets/images/icon.png',
    package: 'io.getstream.expotiktokapp',
    config: {
      googleMaps: {
        apiKey: MAPS_KEY,
      },
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
    './config-plugins/with-notifee-maven',
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
