import { useUserContext } from '@/app/user-context';
import { ActivityResponse, CommentResponse } from '@stream-io/feeds-client';

export const ActivityCommentSection = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const comments = activity.comments;
  const { client } = useUserContext();

  const onclick = async () => {
    const comments = Array.from({ length: 100 }, (_, i) => i);

    const batch = [];

    for (const c of comments) {
      if (batch.length === 10) {
        const v = await Promise.allSettled(batch);
        console.log(v[0]);
        batch.length = 0;
      }

      const promise = client?.addComment({
        comment: `comment ${c}`,
        object_id: activity.id,
        object_type: 'activity',
      });

      batch.push(promise);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 antialiased">
      <button onClick={onclick}>tmp</button>

      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
            Discussion ({activity.comment_count})
          </h2>
        </div>
        <form
          className="mb-6"
          onSubmit={(evt) => {
            evt.preventDefault();

            const formData = new FormData(evt.currentTarget);
            console.log(formData.get('comment-text'));

            const text = formData.get('comment-text');
            if (text) {
              client?.addComment({
                comment: text as string,
                object_id: activity.id,
                object_type: 'activity',
              });
            }
          }}
        >
          <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <label htmlFor="comment" className="sr-only">
              Your comment
            </label>
            <textarea
              id="comment"
              name="comment-text"
              rows={6}
              className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
              placeholder="Write a comment..."
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
          >
            Post comment
          </button>
        </form>

        {comments.map((c) => (
          <Comment key={c.id} comment={c} />
        ))}
      </div>
    </section>
  );
};

const Comment = ({ comment }: { comment: CommentResponse }) => {
  return (
    <article className="p-6 text-base bg-white rounded-lg dark:bg-gray-900">
      <footer className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <p className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white font-semibold">
            <img
              className="mr-2 w-6 h-6 rounded-full"
              src={comment.user.image}
              alt={comment.user.name ?? 'N/A'}
            />
            {comment.user.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <time
              dateTime={comment.created_at.toISOString()}
              title={comment.created_at.toLocaleDateString('cs')}
            >
              {comment.created_at.toLocaleDateString()}
            </time>
          </p>
        </div>
        <button
          id="dropdownComment1Button"
          data-dropdown-toggle="dropdownComment1"
          className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 dark:text-gray-400 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          type="button"
        >
          <span className="material-symbols-outlined">more_horiz</span>
          <span className="sr-only">Comment settings</span>
        </button>
        <div
          id="dropdownComment1"
          className="hidden z-10 w-36 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
        >
          <ul
            className="py-1 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownMenuIconHorizontalButton"
          >
            <li>
              <a
                href="#"
                className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Edit
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Remove
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Report
              </a>
            </li>
          </ul>
        </div>
      </footer>
      <p className="text-gray-500 dark:text-gray-400">{comment.text}</p>
      <div className="flex items-center mt-4 space-x-4">
        <button
          type="button"
          className="flex items-center text-sm text-gray-500 gap-1 dark:text-gray-400 font-medium"
        >
          <div className="text-sm material-symbols-outlined">comment</div>
          Reply
        </button>
      </div>
    </article>
  );
};
