import type {
  CommentResponse,
} from '@stream-io/feeds-react-sdk';
import { useActivityComments } from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { Comment } from './Comment';
import { LoadingIndicator } from '../utility/LoadingIndicator';

export const CommentReplies = ({
  parentComment,
  depth = 1,
}: {
  parentComment: CommentResponse;
  depth?: number;
}) => {
  const {
    comments: replies = [],
    loadNextPage,
    has_next_page,
  } = useActivityComments({
    parentComment,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleReplies = useCallback(() => {
    if (replies.length === 0 && !isExpanded) {
      setIsLoading(true);
      void loadNextPage({ limit: 5, sort: 'best' }).finally(() => {
        setIsLoading(false);
        setIsExpanded(true);
      });
    } else {
      setIsExpanded((prev) => !prev);
    }
  }, [loadNextPage, replies.length, isExpanded]);

  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    void loadNextPage({ limit: 5, sort: 'best' }).finally(() => {
      setIsLoading(false);
    });
  }, [loadNextPage]);

  if (parentComment.reply_count === 0 && replies.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-1">
      <button
        className="btn btn-ghost btn-xs text-base-content/70 gap-1 -ml-2"
        onClick={handleToggleReplies}
        disabled={isLoading}
      >
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            <span className="material-symbols-outlined text-base">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {isExpanded
              ? 'Hide replies'
              : `${parentComment.reply_count} ${parentComment.reply_count === 1 ? 'reply' : 'replies'}`}
          </>
        )}
      </button>

      {isExpanded && replies.length > 0 && (
        <div className="w-full border-l-2 border-base-300 pl-4 mt-2 flex flex-col gap-4">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth}
            />
          ))}

          {has_next_page && (
            <button
              className="btn btn-ghost btn-xs text-primary gap-1"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? <LoadingIndicator /> : 'Load more replies'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
