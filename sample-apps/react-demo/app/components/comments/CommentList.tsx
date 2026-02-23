import type { ActivityState } from '@stream-io/feeds-react-sdk';
import { useActivityComments, useActivityWithStateUpdatesContext, useStateStore } from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
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

  const loadNext = useCallback(() => {
    setIsLoading(true);
    void loadNextPage().catch(e => {
      setError(e.message);
      throw e;
    }).finally(() => {
      setIsLoading(false);
    });
  }, [loadNextPage]);

  if (error) {
    return <ErrorCard message="Failed to load comments" error={error} />;
  }

  return (
    <>
      {(comments.length === 0 && isLoading) ? (
        <LoadingIndicator />
      ) : (
        <>
          <ul className="list w-full">
            {comments.map((comment) => (
              <li className="w-full px-4 py-3 border-b border-base-content/10" key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
          {commentCount > 0 && has_next_page && comments.length > 0 && (
            <button
              className="my-4 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
              onClick={loadNext}
            >
              {isLoading ? <LoadingIndicator /> : 'Load more comments'}
            </button>
          )}
          {isLoading && comments.length > 0 && <LoadingIndicator />}
          {!has_next_page && !isLoading && comments.length > 0 && (
            <p className="py-8 text-center text-sm text-base-content/60">You've reached the end</p>
          )}
        </>
      )
      }
    </>
  );
};
