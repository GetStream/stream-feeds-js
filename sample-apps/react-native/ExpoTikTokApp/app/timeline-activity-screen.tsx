import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
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

const ActivityItem = React.memo(UnmemoizedActivityItem);

const ActivityItemWrapper = ({
  activity,
  index,
}: {
  activity: ActivityResponse;
  index: number;
}) => {
  const { activeId } = useActivityPagerContext();
  const isActive = activeId === activity.id;

  return <ActivityItem activity={activity} isActive={isActive} />;
};

const renderItem = ({
  item,
  index,
}: {
  item: ActivityResponse;
  index: number;
}) => {
  return <ActivityItemWrapper activity={item} index={index} />;
};

const keyExtractor = (item: ActivityResponse) => item.id;

const getItemLayout = (
  _: ArrayLike<ActivityResponse> | null | undefined,
  index: number,
) => ({
  length: SCREEN_HEIGHT,
  offset: SCREEN_HEIGHT * index,
  index,
});

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
      // setCurrentIndex(currentIndex); // use container height
      setActiveId(activities?.[currentIndex]?.id);
      console.log('Snapped to index2:', currentIndex);
      console.log('Got activity: ', activities?.[currentIndex]);
    },
  );

  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const flatListRef = useRef<FlatList<ActivityResponse>>(null);

  const maintainVisibleContentPosition = useMemo(
    () => ({
      minIndexForVisible:
        activities && activities.length && activeIdRef.current
          ? activities?.findIndex((a) => a.id === activeIdRef.current)
          : 0,
      autoscrollToTopThreshold: undefined,
    }),
    [activities],
  );

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
      <FlatList
        ref={flatListRef}
        // @ts-expect-error Using FlatList internal
        strictMode={true}
        data={activities}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialScrollIndex={Number(initialIndex)}
        snapToAlignment="start"
        decelerationRate="fast"
        style={styles.listStyle}
        contentContainerStyle={styles.listContentContainerStyle}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleSnap}
        initialNumToRender={3}
        windowSize={5}
        getItemLayout={getItemLayout}
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
});
