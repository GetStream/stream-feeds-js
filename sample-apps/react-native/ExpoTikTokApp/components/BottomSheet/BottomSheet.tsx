import React, { PropsWithChildren, useEffect, useRef } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useBottomSheetState } from '@/hooks/useBottomSheetState';
import { closeSheet as closeSheetInternal } from '@/store/bottom-sheet-state-store';

type Props = PropsWithChildren;

const { height: SCREEN_H } = Dimensions.get('window');
const SPRING = { duration: 150 };
const BOTTOM_SHEET_HEIGHT = Math.round(SCREEN_H * 0.4);
const BOTTOM_SHEET_Y = SCREEN_H - BOTTOM_SHEET_HEIGHT;
const BACKDROP_OPACITY = 0.4;

export function BottomSheet({ children }: Props) {
  const { open, closeSheet } = useBottomSheetState();
  const maxTranslateY = SCREEN_H;
  const translateY = useSharedValue(maxTranslateY);

  useEffect(() => {
    if (open) {
      translateY.value = withTiming(BOTTOM_SHEET_Y, SPRING);
    } else {
      translateY.value = withTiming(maxTranslateY, SPRING, (finished) => {
        if (finished) {
          runOnJS(closeSheet)();
        }
      });
    }
  }, [closeSheet, maxTranslateY, open, translateY]);

  const dragStartY = useRef(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStartY.current = 0;
    })
    .onUpdate((e) => {
      if (dragStartY.current === 0) dragStartY.current = translateY.value;
      const next = dragStartY.current + e.translationY;
      const minY = BOTTOM_SHEET_Y;
      const maxY = maxTranslateY;
      const overTop = next < minY;
      const overBottom = next > maxY;
      translateY.value = overTop
        ? minY - (minY - next) * 0.2
        : overBottom
          ? maxY + (next - maxY) * 0.2
          : next;
    })
    .onEnd((e) => {
      'worklet';

      // very basic momentum bias
      const projected = e.translationY + e.velocityY * 0.15;
      const nearest =
        projected >= BOTTOM_SHEET_HEIGHT * 0.5 ? maxTranslateY : BOTTOM_SHEET_Y;
      translateY.value = withTiming(nearest, SPRING, (finished) => {
        if (finished && nearest === maxTranslateY)
          runOnJS(closeSheetInternal)();
      });
    });

  const backdropStyle = useAnimatedStyle(() => {
    const minY = BOTTOM_SHEET_Y;
    const t =
      1 -
      Math.min(
        1,
        Math.max(0, (translateY.value - minY) / (maxTranslateY - minY)),
      );
    return {
      opacity: t * BACKDROP_OPACITY,
      pointerEvents: t > 0.02 ? 'auto' : ('none' as any),
    };
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeSheetInternal}
        />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handleContainer} pointerEvents="none">
            <View style={styles.handle} />
          </View>

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#000' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SCREEN_H,
    transform: [{ translateY: SCREEN_H }],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 12,
      },
      android: { elevation: 18 },
    }),
  },
  handleContainer: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444' },
  content: { flex: 1 },
});
