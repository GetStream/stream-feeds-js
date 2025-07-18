import type { ActivityResponse } from '@stream-io/feeds-react-native-sdk';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useActivityPagerContext } from '@/contexts/ActivityPagerContext';
import { PagerVideo } from '@/components/ActivityPager/PagerVideo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const UnmemoizedPagerItem = ({
  activity,
  isActive,
}: {
  activity: ActivityResponse;
  isActive: boolean;
}) => {
  const videoAttachment = useMemo(
    () => activity.attachments.find((a) => a.type === 'video'),
    [activity.attachments],
  );
  if (videoAttachment?.asset_url) {
    return (
      <PagerVideo source={videoAttachment.asset_url} isActive={isActive} />
    );
  }
  return (
    <View style={styles.page}>
      <View style={styles.placeholder}>
        <Text style={{ color: 'white' }}>{activity.id}</Text>
        <Text
          style={{ color: 'white' }}
        >{`Is this activity active: ${isActive}`}</Text>
      </View>
    </View>
  );
};

const InnerPagerItem = React.memo(UnmemoizedPagerItem);

export const PagerItem = ({ activity }: { activity: ActivityResponse }) => {
  const { activeId } = useActivityPagerContext();
  const isActive = activeId === activity.id;

  return <InnerPagerItem activity={activity} isActive={isActive} />;
};

const styles = StyleSheet.create({
  page: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  controlsContainer: {
    padding: 10,
  },
});
