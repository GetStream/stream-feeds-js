import { forwardRef, useCallback, useImperativeHandle, useRef, useState, useEffect, useMemo } from 'react';
import type { Feed, FeedState } from '@stream-io/feeds-react-sdk';
import { useMembers, useStateStore } from '@stream-io/feeds-react-sdk';
import { Avatar } from './utility/Avatar';
import { NavLink } from './utility/NavLink';
import { LoadingIndicator } from './utility/LoadingIndicator';
import { ErrorCard } from './utility/ErrorCard';

export type MembersListModalHandle = {
  open: () => void;
  close: () => void;
};

type MembersListModalProps = {
  feed: Feed;
};

const selector = (state: FeedState) => ({
  createdBy: state.created_by
});

export const MembersListModal = forwardRef<MembersListModalHandle, MembersListModalProps>(
  ({ feed }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>(undefined);
    const { createdBy } = useStateStore(feed.state, selector);

    const membersData = useMembers(feed);

    const members = membersData?.members;
    const membersExcludingOwner = useMemo(
      () => members?.filter((m) => m.user.id !== createdBy?.id) ?? [],
      [members, createdBy?.id],
    );
    const loadNextPage = membersData?.loadNextPage;

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

      if (!members || members.length === 0) {
        setIsInitialLoading(true);
        loadNextPage({ limit: 20 })
          .catch((e) => setError(e))
          .finally(() => setIsInitialLoading(false));
      }
    }, [isOpen, members, loadNextPage]);

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

    const hasNextPage = membersData?.has_next_page ?? false;
    const isLoadingNextPage = membersData?.is_loading_next_page ?? false;

    return (
      <dialog ref={dialogRef} className="modal members-list-modal" onClose={handleClose}>
        <div className="modal-box w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Members</h3>
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
            {!isInitialLoading && !error && membersExcludingOwner.length === 0 && (
              <p className="text-center text-base-content/60 py-8">
                No members yet
              </p>
            )}

            {/* List items */}
            {membersExcludingOwner.map((member) => (
              <NavLink key={member.user.id} href={`/profile/${member.user.id}`}>
                <div
                  className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer"
                  onClick={close}
                >
                  <Avatar user={member.user} className="size-10" />
                  <span className="font-medium">{member.user.name}</span>
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

MembersListModal.displayName = 'MembersListModal';
