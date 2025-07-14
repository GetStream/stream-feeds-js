import { useMemo } from 'react';
import { Feed, FeedState } from '../../src/Feed';
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

export const useFollowing = (feed: Feed | undefined) => {
  const data = useStateStore(feed?.state, selector);

  const loadNextPage = useMemo(() => {
    if (!feed) return undefined;

    return (...options: Parameters<Feed['loadNextPageFollowing']>) =>
      feed?.loadNextPageFollowing(...options);
  }, [feed]);

  return useMemo(() => {
    return {
      following_count: data?.following_count ?? 0,
      following: data?.following ?? [],
      following_pagination: data?.following_pagination,
      isLoadingNextPage: data?.following_pagination?.loading_next_page ?? false,
      loadNextPage,
    };
  }, [data, loadNextPage]);
};
