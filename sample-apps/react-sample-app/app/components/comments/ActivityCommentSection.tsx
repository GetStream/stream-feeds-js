import clsx from 'clsx';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import type {
  ActivityResponse,
  CommentResponse,
  Feed,
} from '@stream-io/feeds-client';
import { useUserContext } from '@/app/user-context';
import { useComments } from '@/app/hooks/useComments';
import { PaginatedList } from '../PaginatedList';

const DEFAULT_PAGINATION_SORT = 'first' as const;

export const ActivityCommentSection = ({
  activity,
  feed,
}: {
  feed: Feed;
  activity: ActivityResponse;
}) => {
  const { client } = useUserContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { comments, commentPagination } = useComments(feed, activity);

  const [parent, setParent] = useState<null | CommentResponse>(null);

  const setParentComment = useCallback((p: CommentResponse) => {
    textareaRef.current?.focus();
    setParent(p);
  }, []);

  useEffect(() => {
    if (comments.length) return;

    void feed.loadNextPageActivityComments(activity, {
      sort: DEFAULT_PAGINATION_SORT,
      limit: 5,
    });
  }, [comments]);

  const scrollToComment = (comment: CommentResponse) => {
    const element = document.querySelector(`[data-comment-id="${comment.id}"]`);

    if (!element) {
      return;
    }
    element.classList.add('bg-blue-50');
    setTimeout(() => {
      element.classList.remove('bg-blue-50');
    }, 1500);
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const currentTarget = event.currentTarget as HTMLFormElement;
    const formData = new FormData(currentTarget);

    const text = formData.get('comment-text');

    if (text) {
      client
        ?.addComment({
          comment: text as string,
          object_id: activity.id,
          object_type: 'activity',
          parent_id: parent?.id,
        })
        .then(() => {
          currentTarget.reset();
          setParent(null);
        });
    }
  };

  return (
    <section className="bg-white antialiased">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg lg:text-2xl font-bold text-gray-900 ">
            Discussion ({activity.comment_count})
          </h2>
        </div>

        {parent && (
          <div className="text-black p-2 flex items-center justify-between bg-gray-100 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <strong>Replying to:</strong>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => scrollToComment(parent)}
              >
                {parent.text}
              </button>
            </div>
            <button
              className="ml-2 text-blue-600 hover:underline"
              onClick={() => setParent(null)}
            >
              Cancel reply
            </button>
          </div>
        )}

        <form className="mb-6" onSubmit={handleSubmit}>
          <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200">
            <label htmlFor="comment" className="sr-only">
              Your comment
            </label>
            <textarea
              ref={textareaRef}
              id="comment"
              name="comment-text"
              rows={6}
              className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none"
              placeholder="Write a comment..."
              required
            />
          </div>
          <button
            type="submit"
            className=" px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Post comment
          </button>
        </form>

        <PaginatedList
          items={comments}
          isLoading={commentPagination?.loading_next_page ?? false}
          hasNext={commentPagination?.next !== 'eol'}
          renderItem={(c) => (
            <Comment
              feed={feed}
              level={0}
              key={c.id}
              setParent={setParentComment}
              comment={c}
            />
          )}
          onLoadMore={() =>
            feed.loadNextPageActivityComments(activity, {
              limit: 5,
            })
          }
          renderNoItems={() => null}
        />
      </div>
    </section>
  );
};

const levels = ['ml-6', 'ml-10', 'ml-14', 'ml-16'];

const Comment = ({
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
  const { comments, commentPagination } = useComments(feed, comment);

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
          <button
            id="dropdownComment1Button"
            data-dropdown-toggle="dropdownComment1"
            className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50"
            type="button"
          >
            <span className="material-symbols-outlined">more_horiz</span>
            <span className="sr-only">Comment settings</span>
          </button>
          <div
            id="dropdownComment1"
            className="hidden z-10 w-36 bg-white rounded divide-y divide-gray-100 shadow"
          >
            <ul
              className="py-1 text-sm text-gray-700"
              aria-labelledby="dropdownMenuIconHorizontalButton"
            >
              <li>
                <a href="#" className="block py-2 px-4 hover:bg-gray-100">
                  Edit
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 px-4 hover:bg-gray-100">
                  Remove
                </a>
              </li>
              <li>
                <a href="#" className="block py-2 px-4 hover:bg-gray-100">
                  Report
                </a>
              </li>
            </ul>
          </div>
        </footer>
        <p className="text-gray-500">{comment.text}</p>
        <div className="flex items-center mt-4 space-x-4">
          <button
            type="button"
            className="flex items-center text-sm text-gray-500 gap-1 font-medium"
            onClick={() => setParent(comment)}
          >
            <div className="text-sm material-symbols-outlined">comment</div>
            Reply
          </button>
          {comment.reply_count > 0 && !comments.length && (
            <button
              type="button"
              className="flex items-center text-sm text-gray-500 gap-1 font-medium"
              onClick={() =>
                feed.loadNextPageCommentReplies(comment, {
                  sort: DEFAULT_PAGINATION_SORT,
                  limit: 5,
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
        isLoading={commentPagination?.loading_next_page ?? false}
        hasNext={commentPagination?.next !== 'eol'}
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
          feed.loadNextPageCommentReplies(comment, {
            limit: 5,
          })
        }
        renderNoItems={() => null}
      />
    </>
  );
};
