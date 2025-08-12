import { useCallback, useState } from 'react';
import clsx from 'clsx';
import type {
  Feed,
  FeedState,
  CommentResponse,
} from '@stream-io/feeds-react-sdk';
import { FeedOwnCapability } from '@stream-io/feeds-client';
import { useComments, useStateStore } from '@stream-io/feeds-react-sdk';
import { useUserContext } from '@/app/user-context';
import { PaginatedList } from '../PaginatedList';
import { DEFAULT_PAGINATION_SORT } from './ActivityCommentSection';
import { Reactions } from '../reactions/Reactions';

const levels = ['ml-8', 'ml-16', 'ml-24', 'ml-32', 'ml-40'];

export const Comment = ({
  comment,
  setParent,
  level,
  feed,
}: {
  comment: CommentResponse;
  level: number;
  setParent: (c: CommentResponse) => void;
  feed: Feed;
}) => {
  const { client, user } = useUserContext();
  const selector = useCallback(
    (state: FeedState) => ({
      canEdit:
        (state.own_capabilities?.includes(FeedOwnCapability.UPDATE_COMMENT) ??
          false) &&
        comment.user.id === user?.id,
      canDelete:
        (state.own_capabilities?.includes(FeedOwnCapability.DELETE_COMMENT) ??
          false) &&
        comment.user.id === user?.id,
      canAddCommentReaction:
        state.own_capabilities?.includes(
          FeedOwnCapability.ADD_COMMENT_REACTION,
        ) ?? false,
      canRemoveCommentReaction:
        state.own_capabilities?.includes(
          FeedOwnCapability.REMOVE_COMMENT_REACTION,
        ) ?? false,
    }),
    [comment.user.id, user?.id],
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { canDelete, canEdit, canAddCommentReaction } = useStateStore(
    feed.state,
    selector,
  );
  const {
    comments = [],
    has_next_page: hasNextPage,
    is_loading_next_page: isLoadingNextPage,
    loadNextPage,
  } = useComments({ feed, parent: comment });

  return (
    <>
      <article
        data-comment-id={comment.id}
        className={clsx('p-4 text-base bg-white', {
          [levels[level - 1]]: level,
          '[&:not(:first-child)]:border-t border-gray-200': level === 0,
        })}
      >
        <footer className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <p className="inline-flex items-center mr-3 text-sm text-gray-900 font-semibold">
              <img
                className="mr-2 w-6 h-6 rounded-full"
                src={comment.user.image}
                alt={comment.user.name ?? 'N/A'}
              />
              {comment.user.name}
            </p>
            <p className="text-sm text-gray-600">
              <time
                dateTime={comment.created_at.toISOString()}
                title={comment.created_at.toISOString()}
              >
                {comment.created_at.toLocaleString('en', { dateStyle: 'full' })}
              </time>
            </p>
          </div>
          {(canDelete || canEdit) && (
            <div className="relative">
              <button
                className="text-gray-400 flex"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
              <div
                className={`absolute rounded-md right-0 w-48 bg-white shadow-lg flex flex-col items-stretch ${isMenuOpen ? '' : 'hidden'}`}
              >
                {canEdit && (
                  <button
                    className="text-gray-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
                    onClick={() => {
                      setIsMenuOpen(false);
                      console.log('TODO: Edit comment', comment.id);
                    }}
                  >
                    <span className="material-symbols-outlined">edit</span>
                    <div>Edit</div>
                  </button>
                )}
                {canDelete && (
                  <button
                    className="text-red-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
                    onClick={() =>
                      client?.deleteComment({ comment_id: comment.id })
                    }
                  >
                    <span className="material-symbols-outlined">delete</span>
                    <div>Delete</div>
                  </button>
                )}
              </div>
            </div>
          )}
        </footer>
        <p className="text-gray-500 pl-8">{comment.text}</p>
        <div className="flex items-center mt-4 space-x-4 pl-8">
          <button
            type="button"
            className="flex items-center text-sm text-gray-500 gap-1 font-medium"
            disabled={level >= 5}
            onClick={() => setParent(comment)}
          >
            <div className="text-sm material-symbols-outlined">comment</div>
            Reply
          </button>
          <Reactions
            type="like"
            object={comment}
            canReact={canAddCommentReaction}
            showCounter={true}
          />
          {comment.reply_count > 0 && !comments.length && (
            <button
              type="button"
              className="flex items-center text-sm text-gray-500 gap-1 font-medium"
              onClick={() =>
                loadNextPage({
                  sort: DEFAULT_PAGINATION_SORT,
                  limit: 1,
                  depth: 5,
                })
              }
            >
              Load replies ({comment.reply_count})
            </button>
          )}
        </div>
      </article>
      <PaginatedList
        items={comments}
        isLoading={isLoadingNextPage}
        hasNext={hasNextPage}
        renderItem={(c) => (
          <Comment
            feed={feed}
            level={level + 1}
            key={c.id}
            setParent={setParent}
            comment={c}
          />
        )}
        onLoadMore={() =>
          loadNextPage({
            limit: 5,
          })
        }
        renderNoItems={() => null}
      />
    </>
  );
};
