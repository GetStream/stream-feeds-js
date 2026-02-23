import { useCallback, useId, useRef, useState } from 'react';
import { LoadingIndicator } from '../utility/LoadingIndicator';
import { ErrorToast } from '../utility/ErrorToast';

type ContentActionsProps = {
  canEdit: boolean;
  canDelete: boolean;
  onDelete: () => Promise<any> | undefined;
  children: (onClose: () => void, dialogElement: HTMLDialogElement | null) => React.ReactNode;
  isModerated: boolean;
};

export const ContentActions = ({
  canEdit,
  canDelete,
  onDelete,
  children,
  isModerated,
}: ContentActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
    // DaisyUI modal animation is 300ms
    setTimeout(() => setIsEditing(false), 300);
  }, []);

  const openDialog = useCallback(() => {
    setIsEditing(true);
    dialogRef.current?.showModal();
  }, []);

  const deleteContent = useCallback(async () => {
    try {
      setIsDeleting(true);
      setError(undefined);
      await onDelete();
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  if ((!canEdit && !canDelete) || isModerated) {
    return null;
  }

  return (
    <>
      <button
        className="size-8 flex items-center justify-center rounded-full hover:bg-base-200 transition-colors text-base-content/60 cursor-pointer"
        popoverTarget={`content-menu-${id}`}
        style={{ anchorName: `--anchor-${id}` } as React.CSSProperties}
      >
        <span className="material-symbols-outlined text-[18px]!">more_horiz</span>
      </button>
      <div
        className="dropdown rounded-xl bg-base-100 shadow-lg border border-base-content/10 w-40 p-1"
        popover="auto"
        id={`content-menu-${id}`}
        style={{ positionAnchor: `--anchor-${id}` } as React.CSSProperties}
      >
        {canEdit && (
          <button
            className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-base-200/50 transition-colors cursor-pointer"
            onClick={openDialog}
          >
            Edit
          </button>
        )}
        {canDelete && (
          <button
            onClick={deleteContent}
            className="w-full px-3 py-2 text-sm text-left text-error rounded-lg hover:bg-base-200/50 transition-colors cursor-pointer"
          >
            {isDeleting ? <LoadingIndicator /> : 'Delete'}
          </button>
        )}
      </div>
      <ErrorToast error={error} />
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box w-[90%] max-w-xl bg-base-100 rounded-2xl p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/10">
            <span className="text-base font-semibold">Edit post</span>
            <button
              className="size-8 rounded-full hover:bg-base-200 flex items-center justify-center transition-colors"
              onClick={closeDialog}
            >
              <span className="material-symbols-outlined text-[18px]!">close</span>
            </button>
          </div>
          <div className="p-4 [&_.composer]:border-0 [&_.composer]:p-0 [&_.composer]:ring-0 [&_.composer]:focus-within\:border-0 [&_.composer]:focus-within\:ring-0">
            {isEditing ? children(closeDialog, dialogRef.current) : null}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-black/40">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
