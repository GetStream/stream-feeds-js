import { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';

export type ConfirmDialogHandle = {
  open: () => void;
  close: () => void;
};

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'error' | 'warning';
  onConfirm: () => void;
  onCancel?: () => void;
};

export const ConfirmDialog = forwardRef<ConfirmDialogHandle, ConfirmDialogProps>(
  (
    {
      title,
      message,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      confirmVariant = 'primary',
      onConfirm,
      onCancel,
    },
    ref
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const open = useCallback(() => {
      dialogRef.current?.showModal();
    }, []);

    const close = useCallback(() => {
      dialogRef.current?.close();
    }, []);

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    const handleConfirm = useCallback(() => {
      close();
      onConfirm();
    }, [close, onConfirm]);

    const handleCancel = useCallback(() => {
      close();
      onCancel?.();
    }, [close, onCancel]);

    const confirmButtonClass = {
      primary: 'btn-primary',
      error: 'btn-error',
      warning: 'btn-warning',
    }[confirmVariant];

    return (
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box w-full max-w-sm">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="py-4 text-base-content/80">{message}</p>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={handleCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn ${confirmButtonClass}`}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={handleCancel}>
            close
          </button>
        </form>
      </dialog>
    );
  }
);

ConfirmDialog.displayName = 'ConfirmDialog';
