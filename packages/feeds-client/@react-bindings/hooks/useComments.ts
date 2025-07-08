import { useCallback } from 'react';
import type {
  ActivityResponse,
  CommentResponse,
} from '../../src/gen/models';
import type {
  Feed,
  FeedState
} from '../../src/Feed';
import { useStateStore } from './useStateStore';

export const useComments = (
  feed: Feed,
  /**
   * The parent (activity or comment) for which to fetch comments.
   */
  parent: ActivityResponse | CommentResponse,
) => {
  const selector = useCallback(
    (state: FeedState) => ({
      comments: state.comments_by_entity_id?.[parent.id]?.comments ?? [],
      comment_pagination: state.comments_by_entity_id?.[parent.id]?.pagination,
    }),
    [parent.id],
  );

  return useStateStore(feed.state, selector);
};
