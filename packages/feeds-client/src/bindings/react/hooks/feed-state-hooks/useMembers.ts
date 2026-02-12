import { useCallback, useMemo } from 'react';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import type { Feed, FeedState } from '../../../../feed';
import { checkHasAnotherPage } from '../../../../utils';

const selector = ({
  member_count,
  members,
  member_pagination,
}: FeedState) => ({
  member_count,
  members,
  member_pagination,
});

type UseMembersReturnType = ReturnType<typeof selector> & {
  is_loading_next_page: boolean;
  has_next_page: boolean;
  loadNextPage: (
    ...options: Parameters<Feed['loadNextPageMembers']>
  ) => Promise<void>;
};

export function useMembers(feed: Feed): UseMembersReturnType;
export function useMembers(feed?: Feed): UseMembersReturnType | undefined;
export function useMembers(feedFromProps?: Feed) {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const data = useStateStore(feed?.state, selector);

  const loadNextPage = useCallback(
    (...options: Parameters<Feed['loadNextPageMembers']>) =>
      feed?.loadNextPageMembers(...options),
    [feed],
  );

  return useMemo(() => {
    if (!data) {
      return undefined;
    }

    return {
      ...data,
      is_loading_next_page:
        data.member_pagination?.loading_next_page ?? false,
      has_next_page: checkHasAnotherPage(
        data.members,
        data.member_pagination?.next,
      ),
      loadNextPage,
    };
  }, [data, loadNextPage]);
}
