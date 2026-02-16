import { forwardRef, useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import type { Feed, FeedState, UserResponse } from '@stream-io/feeds-react-sdk';
import { useFollowers, useFollowing, useStateStore } from '@stream-io/feeds-react-sdk';
import { Avatar } from './utility/Avatar';
import { NavLink } from './utility/NavLink';
import { LoadingIndicator } from './utility/LoadingIndicator';
import { ErrorCard } from './utility/ErrorCard';

export type FollowListModalHandle = {
  open: () => void;
  close: () => void;
};

type FollowListModalProps = {
  type: 'followers' | 'following';
  feed: Feed;
};

const selctor = (state: FeedState) => ({
  createdBy: state.created_by
});

export const FollowListModal = forwardRef<FollowListModalHandle, FollowListModalProps>(
  ({ type, feed }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>(undefined);
    const { createdBy } = useStateStore(feed.state, selctor);

    const followersData = useFollowers(type === 'followers' ? feed : undefined);
    const followingData = useFollowing(type === 'following' ? feed : undefined);

    const items = type === 'followers' ? followersData?.followers : followingData?.following;
    const loadNextPage = type === 'followers' ? followersData?.loadNextPage : followingData?.loadNextPage;

    const open = useCallback(() => {
      setIsOpen(true);
      setError(undefined);
      dialogRef.current?.showModal();
    }, []);

    const close = useCallback(() => {
      setIsOpen(false);
      dialogRef.current?.close();
    }, []);

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    // Load initial data when modal opens
    useEffect(() => {
      if (!isOpen || !loadNextPage) return;

      if (!items || items.length === 0) {
        setIsInitialLoading(true);
        loadNextPage({ limit: 20 })
          .catch((e) => setError(e))
          .finally(() => setIsInitialLoading(false));
      }
    }, [isOpen, items, type, loadNextPage]);

    const handleLoadMore = useCallback(async () => {
      if (!loadNextPage) return;
      try {
        await loadNextPage({ limit: 20 });
      } catch (e) {
        setError(e as Error);
      }
    }, [loadNextPage]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, []);

    // Extract users from follow relationships
    const users: UserResponse[] = [];
    const follows = type === 'followers' ? followersData?.followers : followingData?.following;
    if (follows) {
      for (const follow of follows) {
        const user = type === 'followers'
          ? follow.source_feed.created_by
          : follow.target_feed.created_by;
        if (user.id === createdBy?.id) {
          continue;
        }
        users.push(user);
      }
    }

    const hasNextPage = type === 'followers'
      ? (followersData?.has_next_page ?? false)
      : (followingData?.has_next_page ?? false);
    const isLoadingNextPage = type === 'followers'
      ? (followersData?.is_loading_next_page ?? false)
      : (followingData?.is_loading_next_page ?? false);

    return (
      <dialog ref={dialogRef} className="modal" onClose={handleClose}>
        <div className="modal-box w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">
              {type === 'followers' ? 'Followers' : 'Following'}
            </h3>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={close}
              aria-label="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {/* Initial loading */}
            {isInitialLoading && (
              <div className="flex justify-center py-8">
                <LoadingIndicator />
              </div>
            )}

            {/* Error state */}
            {error && <ErrorCard message="Failed to load" error={error} />}

            {/* Empty state */}
            {!isInitialLoading && !error && users.length === 0 && (
              <p className="text-center text-base-content/60 py-8">
                {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </p>
            )}

            {/* List items */}
            {users.map((user) => (
              <NavLink key={user.id} href={`/profile/${user.id}`}>
                <div
                  className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer"
                  onClick={close}
                >
                  <Avatar user={user} className="size-10" />
                  <span className="font-medium">{user.name ?? user.id}</span>
                </div>
              </NavLink>
            ))}

            {/* Load more button */}
            {hasNextPage && !error && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleLoadMore}
                disabled={isLoadingNextPage}
              >
                {isLoadingNextPage ? <LoadingIndicator /> : 'Load more'}
              </button>
            )}
          </div>
        </div>

        {/* Backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={close}>close</button>
        </form>
      </dialog>
    );
  }
);

FollowListModal.displayName = 'FollowListModal';
