import {
  Feed,
  ActivityResponse,
  CommentResponse,
  FeedState,
} from '@stream-io/feeds-client';
import { useStateStore } from './useStateStore';
import { useCallback } from 'react';

export const useComments = (
  feed: Feed,
  parent: ActivityResponse | CommentResponse,
) => {
  const selector = useCallback(
    (state: FeedState) => ({
      comments: state.comments_by_entity_id?.[parent.id]?.comments ?? [],
      commentPagination: state.comments_by_entity_id?.[parent.id]?.pagination,
    }),
    [parent.id],
  );

  return useStateStore(feed.state, selector);
};
