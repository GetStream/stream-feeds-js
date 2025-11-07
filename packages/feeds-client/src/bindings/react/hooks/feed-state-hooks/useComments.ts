import { useCallback, useMemo } from 'react';
import {
  type ActivityResponse,
  type CommentResponse,
  type CommentParent,
  type Feed,
  type FeedState,
  checkHasAnotherPage,
  isCommentResponse,
  StateStore,
} from '@self';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import type {
  ActivityWithStateUpdates,
  ActivityState,
} from '../../../../activity-with-state-updates/activity-with-state-updates';

const isActivityOrFeed = (
  parent: CommentParent | ActivityWithStateUpdates | Feed,
): parent is ActivityWithStateUpdates | Feed => {
  return 'state' in parent;
};

const isActivity = (
  activityOrFeed: ActivityWithStateUpdates | Feed,
): activityOrFeed is ActivityWithStateUpdates => {
  return 'subscribeToFeedState' in activityOrFeed;
};

type UseCommentsReturnType<T extends ActivityResponse | CommentResponse> = {
  comments: NonNullable<
    (FeedState | ActivityState)['comments_by_entity_id'][T['id']]
  >['comments'];
  comments_pagination: NonNullable<
    (FeedState | ActivityState)['comments_by_entity_id'][T['id']]
  >['pagination'];
  has_next_page: boolean;
  is_loading_next_page: boolean;
  loadNextPage: (
    request?: T extends CommentResponse
      ? Parameters<Feed['loadNextPageCommentReplies']>[1]
      : Parameters<Feed['loadNextPageActivityComments']>[1],
  ) => Promise<void>;
};

export function useComments<T extends CommentParent>(_: {
  parent: ActivityWithStateUpdates;
}): UseCommentsReturnType<T>;
export function useComments<T extends CommentParent>(_: {
  feedOrActivity: Feed | ActivityWithStateUpdates;
  parent: T;
}): UseCommentsReturnType<T> | undefined;
export function useComments<T extends CommentParent>(_: {
  feed: Feed;
  parent: T;
}): UseCommentsReturnType<T>;
export function useComments<T extends CommentParent>(_: {
  feed?: Feed;
  parent: T;
}): UseCommentsReturnType<T> | undefined;
export function useComments<T extends CommentParent>({
  feed: feedFromProps,
  feedOrActivity: feedOrActivityFromProps,
  parent: parentFromProps,
}: {
  feed?: Feed;
  feedOrActivity?: Feed | ActivityWithStateUpdates;
  /**
   * The parent (activity or comment) for which to fetch comments.
   */
  parent?: T | ActivityWithStateUpdates;
}) {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;
  const parent = parentFromProps;
  const feedOrActivity = feedOrActivityFromProps ?? feed ?? parent;

  if (!parent) {
    throw new Error('Invalid parent');
  }

  if (!feedOrActivity || !isActivityOrFeed(feedOrActivity)) {
    throw new Error('Provide feed or activity or parent');
  }

  const selector = useCallback(
    (state: FeedState | ActivityState) => ({
      comments: state.comments_by_entity_id?.[parent.id]?.comments,
      comments_pagination: state.comments_by_entity_id?.[parent.id]?.pagination,
    }),
    [parent.id],
  );

  const data = useStateStore(
    feedOrActivity.state as StateStore<FeedState | ActivityState>,
    selector,
  );

  const loadNextPage = useMemo<
    UseCommentsReturnType<T>['loadNextPage'] | undefined
  >(() => {
    if (!feedOrActivity) return undefined;

    return (request) => {
      if (isCommentResponse(parent)) {
        return feedOrActivity.loadNextPageCommentReplies(parent, request);
      } else {
        if (isActivity(feedOrActivity)) {
          return feedOrActivity.loadNextPageActivityComments(request);
        } else {
          return feedOrActivity.loadNextPageActivityComments(
            parent.id,
            request,
          );
        }
      }
    };
  }, [feedOrActivity, parent]);

  return useMemo(() => {
    if (!data) {
      return undefined;
    }

    return {
      ...data,
      has_next_page: checkHasAnotherPage(
        data.comments,
        data.comments_pagination?.next,
      ),
      is_loading_next_page:
        data?.comments_pagination?.loading_next_page ?? false,
      loadNextPage,
    };
  }, [data, loadNextPage]);
}
