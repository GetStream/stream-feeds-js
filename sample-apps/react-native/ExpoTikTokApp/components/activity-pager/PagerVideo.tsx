import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
// @ts-expect-error Types aren't available in the Mux data SDK
import muxReactNativeVideo from '@mux/mux-data-react-native-video';
import app from '../../package.json';
import {
  useClientConnectedUser
} from '@stream-io/feeds-react-native-sdk';

const RNVideo = lazy(() => import('react-native-video'));

const Video = muxReactNativeVideo(RNVideo);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PagerVideo = ({
  source,
  isActive,
  title,
  duration
}: {
  source: string;
  isActive: boolean;
  title: string,
  duration: number;
}) => {
  const connectedUser = useClientConnectedUser();
  const [isLoading, setIsLoading] = useState(false);
  const [paused, setPaused] = useState(true);

  const muxOptions = useMemo(() => ({
    application_name: app.name,
    application_version: app.version,
    data: {
      env_key: 'q116kekek6s9itegtnvd8o27n',
      video_id: source,
      video_title: title,
      video_duration: duration,
      viewer_user_id: connectedUser?.id,
      player_software_version: '6.16.1',
      player_name: 'React Native Video Player',
    },
  }), [connectedUser?.id, duration, source, title])

  useEffect(() => {
    if (isActive) {
      setPaused(false);
    } else {
      setPaused(true);
    }
  }, [isActive]);

  if (!connectedUser) {
    return null;
  }

  return (
    <View style={styles.page}>
      <Suspense
        fallback={
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        }
      >
        <Video
          style={styles.video}
          source={{ uri: source }}
          repeat={true}
          paused={paused}
          resizeMode="contain"
          controls={false}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          muxOptions={muxOptions}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: SCREEN_HEIGHT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
