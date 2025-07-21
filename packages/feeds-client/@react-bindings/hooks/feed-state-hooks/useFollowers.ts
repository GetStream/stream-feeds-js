import { useCallback, useMemo } from 'react';
import { Feed, FeedState } from '../../../src/Feed';
import { useStateStore } from '../useStateStore';
import { checkHasAnotherPage } from '../../../src/utils';
import { useFeedContext } from '../../contexts/StreamFeedContext';

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
  is_loading_next_page: boolean;
  has_next_page: boolean;
  loadNextPage: (
    ...options: Parameters<Feed['loadNextPageFollowers']>
  ) => Promise<void>;
};

export function useFollowers(feed: Feed): UseFollowersReturnType;
export function useFollowers(feed?: Feed): UseFollowersReturnType | undefined;
export function useFollowers(feedFromProps?: Feed) {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

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
      is_loading_next_page: data.followers_pagination?.loading_next_page ?? false,
      has_next_page: checkHasAnotherPage(
        data.followers,
        data.followers_pagination?.next,
      ),
      loadNextPage,
    };
  }, [data, loadNextPage]);
}
