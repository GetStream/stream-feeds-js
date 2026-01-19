'use client';

import {
  type BookmarkResponse,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useEffect, useState } from 'react';
import { ActivityPreview } from '../components/activity/ActivityPreview';
import { LoadingIndicator } from '../components/utility/LoadingIndicator';

export default function Bookmarks() {
  const client = useFeedsClient();
  const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
  const [next, setNext] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const loadBookmarks = useCallback(
    (nextCursor?: string) => {
      setIsLoading(true);
      client
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
        .finally(() => {
          setIsLoading(false);
        });
    },
    [client],
  );

  useEffect(() => {
    loadBookmarks();
  }, [client, loadBookmarks]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <div className="text-lg font-semibold w-full">Bookmarks</div>

      {bookmarks.length === 0 && isLoading && <LoadingIndicator />}
      {bookmarks.length === 0 && !isLoading ? (
        <div className="card card-border bg-base-100 w-96">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No bookmarks yet <span className="material-symbols-outlined fill">bookmark</span></h2>
            <p>Bookmark posts to see them here</p>
          </div>
        </div>
      ) : (
        <>
          <ul className="w-full list">
            {bookmarks.map((bookmark) => (
              <li className="list-row" key={bookmark.activity.id}>
                <ActivityPreview
                  activity={bookmark.activity}
                />
              </li>
            ))}

          </ul>
          {next && (
            <button
              className="btn btn-soft btn-primary"
              onClick={() => loadBookmarks(next)}
            >
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}
