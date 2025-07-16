import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import {
  ActivityResponse,
  StreamFeed,
  useFeedActivities,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityPagerContextProvider,
  useActivityPagerContext,
} from '@/contexts/ActivityPagerContext';
import { useStableCallback } from '@/hooks/useStableCallback';
import Video from 'react-native-video';
import { FlashList } from '@shopify/flash-list';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Unfortunately, paging works differently on iOS and Android and
// so we need different handling for both.
const pagerProps =
  Platform.OS === 'ios'
    ? { pagingEnabled: true }
    : { snapToInterval: SCREEN_HEIGHT, disableIntervalMomentum: true };

const UnmemoizedActivityItem = ({
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
      <ActivityVideo source={videoAttachment.asset_url} isActive={isActive} />
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

const ActivityVideo = ({
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
        resizeMode='contain'
        controls={false}
      />
    </View>
  );
};

const ActivityItem = React.memo(UnmemoizedActivityItem);

const ActivityItemWrapper = ({ activity }: { activity: ActivityResponse }) => {
  const { activeId } = useActivityPagerContext();
  const isActive = activeId === activity.id;

  return <ActivityItem activity={activity} isActive={isActive} />;
};

const renderItem = ({ item }: { item: ActivityResponse }) => {
  return <ActivityItemWrapper activity={item} />;
};

const keyExtractor = (item: ActivityResponse) => item.id;

const TimelineActivityUI = () => {
  const { initialIndex } = useLocalSearchParams();
  const { activities } = useFeedActivities() ?? {};
  const [activeId, setActiveId] = useState<string | undefined>(
    activities?.[Number(initialIndex)]?.id,
  );

  const handleSnap = useStableCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const currentIndex = Math.round(offsetY / SCREEN_HEIGHT);
      setActiveId(activities?.[currentIndex]?.id);
    },
  );

  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const flatListRef = useRef<FlashList<ActivityResponse>>(null);

  useEffect(() => {
    if (
      activities &&
      activities.length &&
      activeIdRef.current &&
      flatListRef.current
    ) {
      const newIndex = activities?.findIndex(
        (a) => a.id === activeIdRef.current,
      );
      flatListRef.current.scrollToIndex({ index: newIndex, animated: false });
    }
  }, [activities]);

  return (
    <ActivityPagerContextProvider currentIndex={0} activeId={activeId}>
      <FlashList
        ref={flatListRef}
        estimatedItemSize={SCREEN_HEIGHT}
        data={activities}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialScrollIndex={Number(initialIndex)}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleSnap}
        {...pagerProps}
      />
    </ActivityPagerContextProvider>
  );
};

export default function TimelineActivityScreen() {
  const client = useFeedsClient();
  const { groupId, id } = useLocalSearchParams();

  const feed = useMemo(
    () => client?.feed(groupId as string, id as string),
    [groupId, id, client],
  );

  if (!feed) {
    return null;
  }

  return (
    <StreamFeed feed={feed}>
      <TimelineActivityUI />
    </StreamFeed>
  );
}

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
  listStyle: { flex: 1 },
  listContentContainerStyle: { flexGrow: 1 },
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  video: {
    width: '100%',
    height: SCREEN_HEIGHT,
  },
  controlsContainer: {
    padding: 10,
  },
});
