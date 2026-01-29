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
    <div className="w-full flex flex-col items-center justify-start gap-4">
      {is_loading && <LoadingIndicator />}
      {!is_loading && activities?.length === 0 ? (
        <div className="card card-border bg-base-100 w-96">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No posts yet</h2>
            <p>
              {feed?.group === 'foryou'
                ? 'Popular activities will show up here once your application has more content'
                : 'Write something to start your feed ✨'
              }
            </p>
          </div>
        </div>
      ) : (
        <>
          <ul ref={listRef} className="list w-full">
            {activities?.map((activity) => (
              <li className="list-row w-full px-0 flex flex-row justify-stretch items-stretch" key={activity.id}>
                <Activity
                  activity={activity}
                  location={location}
                />
              </li>
            ))}
          </ul>
          {has_next_page && !canScroll && (
            <button className="btn btn-soft btn-primary" onClick={loadNextPage}>
              {is_loading ? <LoadingIndicator /> : 'Load more'}
            </button>
          )}
          {has_next_page && canScroll && <div ref={sentinelRef} className="h-1" />}
          {is_loading && canScroll && <LoadingIndicator />}
        </>
      )}
    </div>
  );
};
