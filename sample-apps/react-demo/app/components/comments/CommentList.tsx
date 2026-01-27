import type { ActivityState } from '@stream-io/feeds-react-sdk';
import { useActivityComments, useActivityWithStateUpdatesContext, useStateStore } from '@stream-io/feeds-react-sdk';
import { useEffect, useState } from 'react';
import { Comment } from './Comment';
import { ErrorCard } from '../utility/ErrorCard';
import { LoadingIndicator } from '../utility/LoadingIndicator';

const selector = (state: ActivityState) => ({
  activity: state.activity,
  commentCount: state.activity?.comment_count ?? 0,
});

export const CommentList = () => {
  const activityWithStateUpdates = useActivityWithStateUpdatesContext();
  const {
    comments = [],
    loadNextPage,
    has_next_page,
  } = useActivityComments();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const { commentCount } = useStateStore(
    activityWithStateUpdates?.state,
    selector,
  ) ?? { commentCount: 0 };

  // Load initial comments
  useEffect(() => {
    if (comments.length === 0 && commentCount > 0) {
      setIsLoading(true);
      void loadNextPage({ limit: 5, sort: 'best' }).catch((e) => {
        setError(e.message);
        throw e;
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [loadNextPage, comments.length, commentCount]);

  if (error) {
    return <ErrorCard message="Failed to load comments" error={error} />;
  }

  return (
    <>
      {(comments.length === 0 && isLoading) ? (
        <LoadingIndicator />
      ) : (
        <>
          <ul className="list pt-0">
            {comments.map((comment) => (
              <li className="list-row w-full flex flex-row justify-stretch items-stretch" key={comment.id}>
                <Comment
                  comment={comment}
                />
              </li>
            ))}
          </ul>
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
