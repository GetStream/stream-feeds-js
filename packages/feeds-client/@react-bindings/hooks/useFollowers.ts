import { useCallback, useMemo } from 'react';
import { Feed, FeedState } from '../../src/Feed';
import { useStateStore } from './useStateStore';
import { Constants } from '../../src/utils';

const selector = ({
  follower_count,
  followers,
  followers_pagination,
}: FeedState) => ({
  follower_count,
  followers,
  followers_pagination,
});

type UseFollowersReturnType = ReturnType<typeof selector> & {
  isLoadingNextPage: boolean;
  hasNextPage: boolean;
  loadNextPage: (
    ...options: Parameters<Feed['loadNextPageFollowers']>
  ) => Promise<void>;
};

export function useFollowers(feed: Feed): UseFollowersReturnType;
export function useFollowers(
  feed: Feed | undefined,
): UseFollowersReturnType | undefined;
export function useFollowers(feed: Feed | undefined) {
  const data = useStateStore(feed?.state, selector);

  const loadNextPage = useCallback(
    (...options: Parameters<Feed['loadNextPageFollowers']>) =>
      feed?.loadNextPageFollowers(...options),
    [feed],
  );

  return useMemo(() => {
    if (!data) {
      return undefined;
    }

    return {
      ...data,
      isLoadingNextPage: data.followers_pagination?.loading_next_page ?? false,
      hasNextPage: data.followers_pagination?.next !==  Constants.END_OF_LIST,
      loadNextPage,
    };
  }, [data, loadNextPage]);
}
