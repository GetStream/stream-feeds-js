import { useCallback, useMemo } from 'react';
import { Feed, FeedState } from '../../src/Feed';
import { checkHasAnotherPage } from '../../src/utils';
import { useStateStore } from './useStateStore';

const selector = ({
  following_count,
  following,
  following_pagination,
}: FeedState) => ({
  following_count,
  following,
  following_pagination,
});

type UseFollowingReturnType = ReturnType<typeof selector> & {
  isLoadingNextPage: boolean;
  hasNextPage: boolean;
  loadNextPage: (
    ...options: Parameters<Feed['loadNextPageFollowers']>
  ) => Promise<void>;
};

export function useFollowing(feed: Feed): UseFollowingReturnType;
export function useFollowing(
  feed: Feed | undefined,
): UseFollowingReturnType | undefined;
export function useFollowing(feed: Feed | undefined) {
  const data = useStateStore(feed?.state, selector);

  const loadNextPage = useCallback(
    (...options: Parameters<Feed['loadNextPageFollowing']>) =>
      feed?.loadNextPageFollowing(...options),
    [feed],
  );

  return useMemo(() => {
    if (!data) {
      return undefined;
    }

    return {
      ...data,
      isLoadingNextPage: data.following_pagination?.loading_next_page ?? false,
      hasNextPage: checkHasAnotherPage(
        data.following,
        data.following_pagination?.next,
      ),
      loadNextPage,
    };
  }, [data, loadNextPage]);
}
