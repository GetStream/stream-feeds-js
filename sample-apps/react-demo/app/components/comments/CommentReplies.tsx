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
    <div className="w-full">
      <button
        className="text-[13px] text-base-content/70 hover:text-base-content inline-flex items-center gap-1 cursor-pointer transition-colors"
        onClick={handleToggleReplies}
        disabled={isLoading}
      >
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            <span className="material-symbols-outlined text-[16px]!">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {isExpanded
              ? 'Hide replies'
              : `${parentComment.reply_count} ${parentComment.reply_count === 1 ? 'reply' : 'replies'}`}
          </>
        )}
      </button>

      {isExpanded && replies.length > 0 && (
        <div className="w-full border-l border-base-content/10 pl-4 mt-3 flex flex-col gap-3">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth}
            />
          ))}

          {has_next_page && (
            <button
              className="text-[13px] text-base-content/70 hover:text-base-content inline-flex items-center gap-1 cursor-pointer transition-colors"
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
