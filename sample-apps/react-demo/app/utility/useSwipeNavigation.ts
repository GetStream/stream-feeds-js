import { useRef, useCallback, type TouchEvent } from 'react';

export type UseSwipeNavigationOptions = {
  /** Minimum horizontal distance (in pixels) to register as a swipe. Defaults to 10. */
  threshold?: number;
  /** When true, only registers swipe if horizontal movement exceeds vertical (prevents conflict with scrolling) */
  requireHorizontalDominance?: boolean;
  /** Whether swiping is enabled */
  enabled?: boolean;
  /** Callback when swiping left (next) */
  onSwipeLeft?: () => void;
  /** Callback when swiping right (previous) */
  onSwipeRight?: () => void;
};

export type SwipeHandlers<T extends HTMLElement = HTMLElement> = {
  onTouchStart: (e: TouchEvent<T>) => void;
  onTouchMove: (e: TouchEvent<T>) => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
};

export function useSwipeNavigation<T extends HTMLElement = HTMLElement>({
  threshold = 10,
  requireHorizontalDominance = false,
  enabled = true,
  onSwipeLeft,
  onSwipeRight,
}: UseSwipeNavigationOptions): SwipeHandlers<T> {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const resetTouchState = useCallback(() => {
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent<T>) => {
      if (!enabled) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchEndX.current = null;
      touchEndY.current = null;
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent<T>) => {
      if (!enabled) return;
      touchEndX.current = e.touches[0].clientX;
      touchEndY.current = e.touches[0].clientY;
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(() => {
    if (
      !enabled ||
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      resetTouchState();
      return;
    }

    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current !== null && touchEndY.current !== null
      ? touchStartY.current - touchEndY.current
      : 0;

    const meetsThreshold = Math.abs(diffX) > threshold;
    const isHorizontalDominant = !requireHorizontalDominance || Math.abs(diffX) > Math.abs(diffY);

    if (meetsThreshold && isHorizontalDominant) {
      if (diffX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }

    resetTouchState();
  }, [enabled, threshold, requireHorizontalDominance, onSwipeLeft, onSwipeRight, resetTouchState]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: resetTouchState,
  };
}
