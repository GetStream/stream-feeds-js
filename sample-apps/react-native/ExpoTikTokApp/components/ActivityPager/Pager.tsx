import { useLocalSearchParams } from 'expo-router';
import { useFeedActivities } from '@stream-io/feeds-react-native-sdk';
import React, { useEffect, useRef, useState } from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent, Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { ActivityResponse } from '@stream-io/feeds-react-native-sdk';
import { ActivityPagerContextProvider } from '@/contexts/ActivityPagerContext';
import { PagerItem } from '@/components/ActivityPager/PagerItem';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Unfortunately, paging works differently on iOS and Android and
// so we need different handling for both.
const pagerProps =
  Platform.OS === 'ios'
    ? { pagingEnabled: true }
    : { snapToInterval: SCREEN_HEIGHT, disableIntervalMomentum: true };

const renderItem = ({ item }: { item: ActivityResponse }) => {
  return <PagerItem activity={item} />;
};

const keyExtractor = (item: ActivityResponse) => item.id;

export const ActivityPager = () => {
  const { initialIndex } = useLocalSearchParams();
  const { activities, hasNextPage, loadNextPage } = useFeedActivities() ?? {};
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
    <ActivityPagerContextProvider activeId={activeId}>
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
        onEndReachedThreshold={0.2}
        onEndReached={loadNextPage}
        {...pagerProps}
      />
    </ActivityPagerContextProvider>
  );
};
