'use client';

import {
  type BookmarkResponse,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useEffect, useState } from 'react';
import { ActivityPreview } from '../components/activity/ActivityPreview';
import { ErrorCard } from '../components/utility/ErrorCard';
import { BookmarksPageSkeleton } from '../components/utility/loading-skeletons/BookmarksPageSkeleton';
import { PageHeader } from '../components/utility/PageHeader';

export default function Bookmarks() {
  const client = useFeedsClient();
  const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
  const [next, setNext] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadBookmarks = useCallback(
    (nextCursor?: string) => {
      setIsLoading(true);
      return client
        ?.queryBookmarks({
          limit: 20,
          next: nextCursor,
        })
        .then((response) => {
          setBookmarks((current) => [
            ...(nextCursor ? current : []),
            ...response.bookmarks,
          ]);
          setNext(response.next);
        })
        .catch((e) => {
          setError(e.message);
          throw e;
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [client],
  );

  useEffect(() => {
    loadBookmarks();
  }, [client, loadBookmarks]);

  if (error) {
    return <ErrorCard message="Failed to load bookmarks" error={error} />;
  }

  if (bookmarks.length === 0 && isLoading) {
    return <BookmarksPageSkeleton />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <PageHeader title="Bookmarks" />
      {bookmarks.length === 0 && !isLoading ? (
        <div className="w-full max-w-sm mx-auto py-12 px-4 text-center">
          <h2 className="text-2xl font-semibold mb-2">No bookmarks yet</h2>
          <p className="text-base-content/60">Bookmark posts to see them here</p>
        </div>
      ) : (
        <>
          <ul className="w-full">
            {bookmarks.map((bookmark) => (
              <li
                className="w-full px-4 py-3 border-b border-base-content/10 hover:bg-base-200/50 transition-colors cursor-pointer"
                key={bookmark.activity.id}
              >
                <ActivityPreview activity={bookmark.activity} />
              </li>
            ))}
          </ul>
          {next && (
            <button
              className="btn btn-soft btn-primary my-4"
              onClick={() => loadBookmarks(next)}
            >
              Load more
            </button>
          )}
          {!next && !isLoading && bookmarks.length > 0 && (
            <p className="py-8 text-center text-sm text-base-content/60">You've reached the end</p>
          )}
        </>
      )}
    </div>
  );
}
