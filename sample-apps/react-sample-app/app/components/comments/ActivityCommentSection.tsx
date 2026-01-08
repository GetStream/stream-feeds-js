import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Feed,
  ActivityWithStateUpdates,
} from '@stream-io/feeds-react-sdk';
import {
  type ActivityResponse,
  type CommentResponse,
  useActivityComments,
  useClientConnectedUser,
  useFeedsClient,
  useOwnFollowings,
} from '@stream-io/feeds-react-sdk';
import { PaginatedList } from '../PaginatedList';
import { Comment } from './Comment';

export const DEFAULT_PAGINATION_SORT = 'first' as const;

export const ActivityCommentSection = ({
  feed,
  activityWithStateUpdates,
  activity,
}: {
  feed?: Feed;
  activityWithStateUpdates?: ActivityWithStateUpdates;
  activity: ActivityResponse;
}) => {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentFeed = useMemo(() => {
    if (!activity.current_feed || !client) {
      return undefined;
    }
    return client.feed(
      activity.current_feed.group_id,
      activity.current_feed.id,
    );
  }, [activity.current_feed, client]);

  const { own_followings: ownFollowings = [] } =
    useOwnFollowings(currentFeed) ?? {};

  const canComment = useMemo(() => {
    if (currentUser?.id === activity.user.id) {
      return true;
    }
    switch (activity.restrict_replies) {
      case 'nobody':
        return false;
      case 'people_i_follow':
        return ownFollowings?.length > 0;
      default:
        return true;
    }
  }, [
    activity.restrict_replies,
    ownFollowings,
    currentUser?.id,
    activity.user.id,
  ]);

  const {
    comments = [],
    loadNextPage,
    is_loading_next_page: isLoadingNextPage,
    has_next_page: hasNextPage,
  } = useActivityComments({
    feed,
    activity: activityWithStateUpdates ?? activity,
  });

  const [parent, setParent] = useState<null | CommentResponse>(null);

  const setParentComment = useCallback((p: CommentResponse) => {
    textareaRef.current?.focus();
    setParent(p);
  }, []);

  useEffect(() => {
    if (!hasNextPage) return;

    void loadNextPage({
      sort: DEFAULT_PAGINATION_SORT,
      limit: 5,
      depth: 5,
      replies_limit: 5,
    });
  }, [hasNextPage, loadNextPage]);

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
          create_notification_activity: true,
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

        {canComment && (
          <>
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
          </>
        )}

        <PaginatedList
          items={comments}
          isLoading={isLoadingNextPage}
          hasNext={hasNextPage}
          renderItem={(c) => (
            <Comment
              canReply={canComment}
              feed={feed}
              activityWithStateUpdates={activityWithStateUpdates}
              level={0}
              key={c.id}
              setParent={setParentComment}
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
      </div>
    </section>
  );
};
