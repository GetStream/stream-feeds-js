import type {
  ActivityState,
  ActivityWithStateUpdates,
} from '@stream-io/feeds-react-sdk';
import { useActivityComments, useStateStore } from '@stream-io/feeds-react-sdk';
import { useEffect, useState } from 'react';
import { Comment } from './Comment';
import { LoadingIndicator } from '../utility/LoadingIndicator';

const selector = (state: ActivityState) => ({
  commentCount: state.activity?.comment_count ?? 0,
});

export const CommentList = ({
  activityWithStateUpdates,
}: {
  activityWithStateUpdates: ActivityWithStateUpdates;
}) => {
  const {
    comments = [],
    loadNextPage,
    has_next_page,
  } = useActivityComments({ activity: activityWithStateUpdates });
  const [isLoading, setIsLoading] = useState(false);

  const { commentCount } = useStateStore(
    activityWithStateUpdates?.state,
    selector,
  ) ?? { commentCount: 0 };

  // Load initial comments
  useEffect(() => {
    if (comments.length === 0 && commentCount > 0) {
      setIsLoading(true);
      void loadNextPage({ limit: 5, sort: 'best' }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [loadNextPage, comments.length, commentCount]);

  return (
    <>
      {(comments.length === 0 && isLoading) ? (
        <LoadingIndicator />
      ) : (
        <>
          {comments.map((comment) => (
            <Comment comment={comment} key={comment.id} />
          ))}
          {commentCount > 0 && has_next_page && comments.length > 0 && (
            <button
              className="btn btn-soft btn-primary"
              onClick={() => loadNextPage()}
            >
              Load more comments
            </button>
          )}
        </>
      )}
    </>
  );
};
