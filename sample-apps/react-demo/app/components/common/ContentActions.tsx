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
    setIsEditing(false);
    dialogRef.current?.close();
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
        className="btn btn-sm btn-ghost text-base-content/60"
        popoverTarget={`content-menu-${id}`}
        style={{ anchorName: `--anchor-${id}` } as React.CSSProperties}
      >
        <span className="material-symbols-outlined">more_horiz</span>
      </button>
      <ul
        className="dropdown menu rounded-box bg-base-100 shadow-sm w-48"
        popover="auto"
        id={`content-menu-${id}`}
        style={{ positionAnchor: `--anchor-${id}` } as React.CSSProperties}
      >
        {canEdit && (
          <li>
            <button
              className="btn btn-sm btn-ghost text-left"
              onClick={openDialog}
            >
              Edit
            </button>
          </li>
        )}
        {canDelete && (
          <li className="text-error">
            <button onClick={deleteContent} className="btn btn-sm btn-ghost text-left">
              {isDeleting ? <LoadingIndicator></LoadingIndicator> : 'Delete'}
            </button>
          </li>
        )}
      </ul>
      <ErrorToast error={error} />
      {<dialog ref={dialogRef} className="modal">
        <div className="modal-box w-[80%] max-w-none sm:w-[40%]">{isEditing ? children(closeDialog, dialogRef.current) : null}</div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>}
    </>
  );
};
