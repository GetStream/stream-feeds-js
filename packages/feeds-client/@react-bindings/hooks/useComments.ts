import { useCallback, useMemo } from 'react';
import type { ActivityResponse, CommentResponse } from '../../src/gen/models';
import type { CommentParent } from '../../src/types';
import { Feed, FeedState } from '../../src/Feed';
import { useStateStore } from './useStateStore';
import { useFeedContext } from '../contexts/StreamFeedContext';
import { isCommentResponse } from '../../src/utils';
import { checkHasAnotherPage } from '../../src/utils';

type UseCommentsReturnType<T extends ActivityResponse | CommentResponse> = {
  comments: NonNullable<
    FeedState['comments_by_entity_id'][T['id']]
  >['comments'];
  comments_pagination: NonNullable<
    FeedState['comments_by_entity_id'][T['id']]
  >['pagination'];
  hasNextPage: boolean;
  isLoadingNextPage: boolean;
  loadNextPage: (
    request?: T extends CommentResponse
      ? Parameters<Feed['loadNextPageCommentReplies']>[1]
      : Parameters<Feed['loadNextPageActivityComments']>[1],
  ) => Promise<void>;
};

export function useComments<T extends CommentParent>({
  feed,
  parent,
}: {
  feed: Feed;
  parent: T;
}): UseCommentsReturnType<T>;
export function useComments<T extends CommentParent>({
  feed,
  parent,
}: {
  feed?: Feed;
  parent: T;
}): UseCommentsReturnType<T> | undefined;
export function useComments<T extends CommentParent>({
  feed: feedFromProps,
  parent,
}: {
  feed?: Feed;
  /**
   * The parent (activity or comment) for which to fetch comments.
   */
  parent: T;
}) {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;

  const selector = useCallback(
    (state: FeedState) => ({
      comments: state.comments_by_entity_id?.[parent.id]?.comments,
      comments_pagination: state.comments_by_entity_id?.[parent.id]?.pagination,
    }),
    [parent.id],
  );

  const data = useStateStore(feed?.state, selector);

  const loadNextPage = useMemo<
    UseCommentsReturnType<T>['loadNextPage'] | undefined
  >(() => {
    if (!feed) return undefined;

    return (request) => {
      if (isCommentResponse(parent)) {
        return feed.loadNextPageCommentReplies(parent, request);
      } else {
        return feed.loadNextPageActivityComments(parent, request);
      }
    };
  }, [feed, parent]);

  return useMemo(() => {
    if (!data) {
      return undefined;
    }

    return {
      ...data,
      hasNextPage: checkHasAnotherPage(
        data.comments,
        data.comments_pagination?.next,
      ),
      isLoadingNextPage: data?.comments_pagination?.loading_next_page ?? false,
      loadNextPage,
    };
  }, [data, loadNextPage]);
}
