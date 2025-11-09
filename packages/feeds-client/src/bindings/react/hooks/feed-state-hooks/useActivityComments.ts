import { useCallback, useMemo } from 'react';
import {
  type ActivityResponse,
  type CommentResponse,
  type Feed,
  type FeedState,
  checkHasAnotherPage,
  ActivityWithStateUpdates,
  type ActivityState,
  StateStore,
} from '@self';
import { useFeedContext } from '../../contexts/StreamFeedContext';
import { useStateStore } from '@stream-io/state-store/react-bindings';

const canLoadComments = (
  feedOrActivity: Feed | ActivityResponse | ActivityWithStateUpdates,
): feedOrActivity is ActivityWithStateUpdates | Feed => {
  return (
    'loadNextPageCommentReplies' in feedOrActivity &&
    'loadNextPageActivityComments' in feedOrActivity
  );
};

type UseCommentsReturnType<T extends ActivityResponse | CommentResponse> = {
  comments: NonNullable<
    FeedState['comments_by_entity_id'][T['id']]
  >['comments'];
  comments_pagination: NonNullable<
    FeedState['comments_by_entity_id'][T['id']]
  >['pagination'];
  has_next_page: boolean;
  is_loading_next_page: boolean;
  loadNextPage: (
    request?: T extends CommentResponse
      ? Parameters<Feed['loadNextPageCommentReplies']>[1]
      : Parameters<Feed['loadNextPageActivityComments']>[1],
  ) => Promise<void>;
};

export function useActivityComments(_: {
  feed: Feed;
  activity: ActivityResponse;
}): UseCommentsReturnType<ActivityResponse>;
export function useActivityComments(_: {
  feed: Feed;
  parentComment: CommentResponse;
}): UseCommentsReturnType<CommentResponse>;
export function useActivityComments(_: {
  activity: ActivityWithStateUpdates;
}): UseCommentsReturnType<ActivityResponse>;
export function useActivityComments(_: {
  activity: ActivityWithStateUpdates;
  parentComment: CommentResponse;
}): UseCommentsReturnType<CommentResponse>;
export function useActivityComments({
  feed: feedFromProps,
  parentComment,
  activity,
}: {
  feed?: Feed;
  parentComment?: CommentResponse;
  activity?: ActivityResponse | ActivityWithStateUpdates;
}) {
  const feed = feedFromProps ?? useFeedContext();
  const feedOrActivity = feed ?? activity;

  if (!feedOrActivity) {
    throw new Error('Feed or activity is required');
  }

  if (!canLoadComments(feedOrActivity)) {
    throw new Error('Feed or activity does not support loading comments');
  }

  const entityId = activity?.id ?? parentComment?.id ?? '';
  const selector = useCallback(
    (state: FeedState | ActivityState) => ({
      comments: state.comments_by_entity_id?.[entityId]?.comments,
      comments_pagination: state.comments_by_entity_id?.[entityId]?.pagination,
    }),
    [entityId],
  );

  const data = useStateStore(
    feedOrActivity.state as StateStore<FeedState | ActivityState>,
    selector,
  );

  const loadNextPage = useMemo<
    | UseCommentsReturnType<ActivityResponse | CommentResponse>['loadNextPage']
    | undefined
  >(() => {
    if (!feed) return undefined;

    return (request) => {
      if (activity) {
        return feedOrActivity.loadNextPageActivityComments(
          activity?.id,
          request,
        );
      } else if (parentComment) {
        return feedOrActivity.loadNextPageCommentReplies(
          parentComment,
          request,
        );
      } else {
        throw new Error('Activity or parent comment is required');
      }
    };
  }, [feed, parent]);

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
