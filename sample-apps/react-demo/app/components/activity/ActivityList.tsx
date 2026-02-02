import { useCallback, useEffect, useRef, useState } from 'react';
import { useFeedActivities, useFeedContext } from '@stream-io/feeds-react-sdk';
import { Activity } from './Activity';
import { ErrorCard } from '../utility/ErrorCard';
import { LoadingIndicator } from '../utility/LoadingIndicator';

const findScrollContainer = (element: HTMLElement | null): HTMLElement | null => {
  if (!element) return null;
  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    const style = getComputedStyle(current);
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      current.scrollHeight > current.clientHeight
    ) {
      return current;
    }
    current = current.parentElement;
  }
  // Fall back to checking document
  if (document.documentElement.scrollHeight > window.innerHeight) {
    return document.documentElement;
  }
  return null;
};

const useInfiniteScroll = ({
  loadNextPage,
  hasNextPage,
  isLoading,
}: {
  loadNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const checkCanScroll = useCallback(() => {
    const scrollContainer = findScrollContainer(listRef.current);
    setCanScroll(scrollContainer !== null);
  }, []);

  useEffect(() => {
    checkCanScroll();
    window.addEventListener('resize', checkCanScroll);
    return () => window.removeEventListener('resize', checkCanScroll);
  }, [checkCanScroll]);

  useEffect(() => {
    checkCanScroll();
  });

  useEffect(() => {
    if (!canScroll || !hasNextPage || isLoading) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollContainer = findScrollContainer(listRef.current);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoading) {
          loadNextPage();
        }
      },
      { root: scrollContainer === document.documentElement ? null : scrollContainer, rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canScroll, hasNextPage, isLoading, loadNextPage]);

  return { sentinelRef, listRef, canScroll };
};

export const ActivityList = ({
  location,
  error,
}: {
  location: 'timeline' | 'profile' | 'foryou';
  error?: Error;
}) => {
  const feed = useFeedContext();
  const { activities, loadNextPage, has_next_page, is_loading } =
    useFeedActivities();

  const { sentinelRef, listRef, canScroll } = useInfiniteScroll({
    loadNextPage,
    hasNextPage: has_next_page ?? false,
    isLoading: is_loading ?? false,
  });

  if (error) {
    return <ErrorCard message="Failed to load feed" error={error} />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start">
      {activities?.length === 0 ? (
        <div className="w-full max-w-sm mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Stream</h2>
          <p className="text-base-content/60">
            {feed?.group === 'foryou'
              ? 'Popular posts will appear here.'
              : "When you follow people, you'll see their posts here."
            }
          </p>
        </div>
      ) : (
        <>
          <ul ref={listRef} className="list w-full">
            {activities?.map((activity) => (
              <li
                className="w-full py-3 border-b border-base-content/20 hover:bg-base-200/50 transition-colors cursor-pointer"
                key={activity.id}
              >
                <Activity activity={activity} location={location} />
              </li>
            ))}
          </ul>
          {has_next_page && !canScroll && (
            <button
              className="my-4 px-5 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-full transition-colors"
              onClick={loadNextPage}
            >
              {is_loading ? <LoadingIndicator /> : 'Show more'}
            </button>
          )}
          {has_next_page && canScroll && <div ref={sentinelRef} className="h-1" />}
          {is_loading && activities && activities.length > 0 && <LoadingIndicator />}
        </>
      )}
    </div>
  );
};
