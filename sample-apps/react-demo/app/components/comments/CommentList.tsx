import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useActivityComments } from '@stream-io/feeds-react-sdk';
import { useEffect } from 'react';

export const CommentList = ({ activity }: { activity: ActivityResponse }) => {
  const {
    comments = [],
    loadNextPage,
    has_next_page,
  } = useActivityComments({ activity });

  // Load initial comments
  useEffect(() => {
    if (comments.length === 0 && activity.comment_count > 0) {
      void loadNextPage({ limit: 5, sort: 'best' });
    }
  }, [loadNextPage, comments.length, activity.comment_count]);

  return (
    <>
      {comments.map((comment) => (
        <div className="flex flex-row items-center gap-2" key={comment.id}>
          <span className="font-semibold">{comment.user.name}:</span>
          <span>{comment.text}</span>
        </div>
      ))}
      {activity.comment_count > 0 && has_next_page && (
        <button
          className="btn btn-soft btn-primary"
          onClick={() => loadNextPage()}
        >
          Load more comments
        </button>
      )}
    </>
  );
};
