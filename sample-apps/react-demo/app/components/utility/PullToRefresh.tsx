'use client';

import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const PULL_THRESHOLD = 80;
const RESISTANCE_FACTOR = 0.4;

type PullToRefreshProps = PropsWithChildren<{
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}>;

export const PullToRefresh = ({
  children,
  onRefresh,
  disabled,
}: PullToRefreshProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);

  const isAtTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    // Check if we're at the top of the scroll container
    let scrollContainer: HTMLElement | null = container;
    while (scrollContainer && scrollContainer !== document.body) {
      const style = getComputedStyle(scrollContainer);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        return scrollContainer.scrollTop <= 0;
      }
      scrollContainer = scrollContainer.parentElement;
    }
    // Check document scroll
    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing || !isAtTop()) return;
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = false;
    },
    [disabled, isRefreshing, isAtTop],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing || startYRef.current === null) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0 && isAtTop()) {
        isPullingRef.current = true;
        // Apply resistance to make pulling feel natural
        const distance = Math.min(diff * RESISTANCE_FACTOR, PULL_THRESHOLD * 1.5);
        setPullDistance(distance);

        // Prevent default scrolling when pulling down at top
        if (distance > 0) {
          e.preventDefault();
        }
      }
    },
    [disabled, isRefreshing, isAtTop],
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isPullingRef.current) {
      startYRef.current = null;
      setPullDistance(0);
      return;
    }

    startYRef.current = null;
    isPullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD * 0.5); // Show spinner at half threshold
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [disabled, pullDistance, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="absolute left-0 right-0 flex justify-center overflow-hidden transition-all duration-200 ease-out"
        style={{
          height: showIndicator ? `${Math.max(pullDistance, isRefreshing ? 40 : 0)}px` : 0,
          opacity: showIndicator ? 1 : 0,
        }}
      >
        <div className="flex items-center justify-center py-2">
          {!isRefreshing && <span
            className="material-symbols-outlined transition-transform duration-200"
            style={{
              transform: `rotate(${progress >= 1 ? 180 : 0}deg)`,
              opacity: progress,
            }}
          >
            arrow_downward
          </span>}
        </div>
      </div>
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${showIndicator ? Math.max(pullDistance, isRefreshing ? 40 : 0) : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
