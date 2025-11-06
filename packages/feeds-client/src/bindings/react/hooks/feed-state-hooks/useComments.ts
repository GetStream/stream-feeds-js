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
import type { Activity, ActivityState } from '../../../../activity/activity';
import { useActivityContext } from '../../contexts/StreamActivityContext';

const isActivityOrFeed = (
  parent: CommentParent | Activity | Feed,
): parent is Activity | Feed => {
  return 'state' in parent;
};

const isActivity = (
  activityOrFeed: Activity | Feed,
): activityOrFeed is Activity => {
  return 'feed' in activityOrFeed;
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

export function useComments<
  T extends CommentParent,
>(_: {}): UseCommentsReturnType<T>;
export function useComments<T extends CommentParent>(_: {
  parent: Activity;
}): UseCommentsReturnType<T>;
export function useComments<T extends CommentParent>(_: {
  activity: Activity;
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
  activity: activityFromProps,
  parent: parentFromProps,
}: {
  feed?: Feed;
  activity?: Activity;
  /**
   * The parent (activity or comment) for which to fetch comments.
   */
  parent?: T | Activity;
}) {
  const activity = activityFromProps ?? useActivityContext();
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;
  const parent = parentFromProps ?? activity;
  const feedOrActivity = activity ?? feed ?? parent;

  if (!parent || !feedOrActivity || !isActivityOrFeed(feedOrActivity)) {
    throw new Error('Invalid parent');
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
