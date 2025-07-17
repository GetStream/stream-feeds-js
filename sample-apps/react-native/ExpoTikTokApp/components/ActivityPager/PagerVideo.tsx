import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PagerVideo = ({
  source,
  isActive,
}: {
  source: string;
  isActive: boolean;
}) => {
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
      <Video
        style={styles.video}
        source={{ uri: source }}
        repeat={true}
        paused={paused}
        resizeMode="contain"
        controls={false}
      />
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
});
