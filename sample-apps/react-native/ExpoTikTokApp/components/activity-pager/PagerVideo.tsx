import React, { lazy, Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';

const Video = lazy(() => import('react-native-video'));

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PagerVideo = ({
  source,
  isActive,
}: {
  source: string;
  isActive: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    if (isActive) {
      setPaused(false);
    } else {
      setPaused(true);
    }
  }, [isActive]);

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
