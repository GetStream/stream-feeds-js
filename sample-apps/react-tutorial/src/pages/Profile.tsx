import {
  BookmarkResponse,
  FeedState,
  useClientConnectedUser,
  useFeedsClient,
  useStateStore,
} from '@stream-io/feeds-react-sdk';
import { useOwnFeedContext } from '../own-feeds-context';
import { useCallback, useEffect, useState } from 'react';
import { ActivitySearchResult } from '../components/activity/ActivitySearchResult';

const followerCountSelector = (state: FeedState) => ({
  // Don't count your own timeline in following feeds
  followerCount: (state.follower_count ?? 0) - 1,
});

const followingCountSelector = (state: FeedState) => ({
  // Don't count yourself as a follower
  followingCount: (state.following_count ?? 0) - 1,
});

export const Profile = () => {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();
  const { ownFeed, ownTimeline } = useOwnFeedContext();
  const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
  const [next, setNext] = useState<string | undefined>(undefined);

  const { followerCount } = useStateStore(
    ownFeed?.state,
    followerCountSelector,
  ) ?? {
    followerCount: 0,
  };
  const { followingCount } = useStateStore(
    ownTimeline?.state,
    followingCountSelector,
  ) ?? {
    followingCount: 0,
  };

  const loadBookmarks = useCallback(() => {
    client
      ?.queryBookmarks({
        limit: 10,
        next,
      })
      .then((response) => {
        setBookmarks([...(next ? bookmarks : []), ...response.bookmarks]);
        setNext(response.next);
      });
  }, [client, next]);

  useEffect(() => {
    loadBookmarks();
  }, [client, loadBookmarks]);

  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <div className="stats">
        <div className="stat">
          <div className="stat-title">Profile</div>
          <div className="stat-value text-primary">{currentUser?.name}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Followers</div>
          <div className="stat-value text-primary">{followerCount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Following</div>
          <div className="stat-value text-primary">{followingCount}</div>
        </div>
      </div>

      <div className="text-lg font-semibold">Bookmarks</div>

      {bookmarks.length === 0 ? (
        <div className="card card-border bg-base-100 w-96">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No bookmarks yet</h2>
            <p>Bookmark posts to see them here ⭐</p>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-start gap-4">
          {bookmarks.map((bookmark) => (
            <ActivitySearchResult
              activity={bookmark.activity}
              key={bookmark.activity.id}
            />
          ))}
          {next && (
            <button
              className="btn btn-soft btn-primary"
              onClick={loadBookmarks}
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
};
