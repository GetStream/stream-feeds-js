import { useMemo } from 'react';
import { Feed, FeedState } from '../../src/Feed';
import { useStateStore } from './useStateStore';

const selector = ({
  follower_count,
  followers,
  followers_pagination,
}: FeedState) => ({
  follower_count,
  followers,
  followers_pagination,
});

export const useFollowers = (feed: Feed | undefined) => {
  const data = useStateStore(feed?.state, selector);

  const loadNextPage = useMemo(() => {
    if (!feed) return undefined;

    return (...options: Parameters<Feed['loadNextPageFollowers']>) =>
      feed?.loadNextPageFollowers(...options);
  }, [feed]);

  return useMemo(() => {
    return {
      follower_count: data?.follower_count ?? 0,
      followers: data?.followers ?? [],
      followers_pagination: data?.followers_pagination,
      isLoadingNextPage: data?.followers_pagination?.loading_next_page ?? false,
      loadNextPage,
    };
  }, [data, loadNextPage]);
};
