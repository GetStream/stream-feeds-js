import { useCallback, useMemo } from 'react';
import { useStateStore } from '@stream-io/state-store/react-bindings';
import type { StateStore } from '@stream-io/state-store';

import { useFeedContext } from '../../contexts/StreamFeedContext';
import { checkHasAnotherPage } from '../../../../utils';
import type { Feed, FeedState } from '../../../../feed';
import type { ActivityState, ActivityWithStateUpdates } from '../../../../activity-with-state-updates/activity-with-state-updates';
import type { ActivityResponse, CommentResponse } from '../../../../gen/models';
import { useActivityWithStateUpdatesContext } from '../../contexts/StreamActivityWithStateUpdatesContext';

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

export function useActivityComments({
  feed: feedFromProps,
  parentComment,
  activity: activityFromProps,
}: {
  feed?: Feed;
  parentComment?: CommentResponse;
  activity?: ActivityResponse | ActivityWithStateUpdates;
} = {}) {
  const feedFromContext = useFeedContext();
  const feed = feedFromProps ?? feedFromContext;
  const activityFromContext = useActivityWithStateUpdatesContext();
  const activity = activityFromProps ?? activityFromContext;
  const feedOrActivity = (activity && canLoadComments(activity)) ? activity : feed;

  if (!feedOrActivity) {
    throw new Error('Feed or activity is required');
  }

  if (!canLoadComments(feedOrActivity)) {
    throw new Error('Feed or activity does not support loading comments');
  }

  if (!(activity || parentComment)) {
    throw new Error('Activity or parent comment is required');
  }

  const entityId = parentComment?.id ?? activity?.id ?? '';
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

  const loadNextPage = useCallback<
    UseCommentsReturnType<ActivityResponse | CommentResponse>['loadNextPage']
  >(
    (request) => {
      if (parentComment) {
        return feedOrActivity.loadNextPageCommentReplies(
          parentComment,
          request,
        );
      } else {
        if (activity && canLoadComments(activity)) {
          return activity.loadNextPageActivityComments(request);
        } else if (feed) {
          return feed.loadNextPageActivityComments(activity?.id ?? '', request);
        } else {
          throw new Error('Activity or feed is required');
        }
      }
    },
    [feedOrActivity, feed, parentComment, activity],
  );

  return useMemo(() => {
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
