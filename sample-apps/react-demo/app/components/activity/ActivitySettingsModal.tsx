import { useCallback, useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';

export type RestrictRepliesValue = 'everyone' | 'people_i_follow' | 'nobody';

export type ActivitySettingsModalHandle = {
  open: () => void;
  close: () => void;
};

type ActivitySettingsModalProps = {
  initialValue?: RestrictRepliesValue;
  onSave: (value: RestrictRepliesValue) => void;
  onCancel?: () => void;
};

const OPTIONS: Array<{
  value: RestrictRepliesValue;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'everyone',
    label: 'Everyone',
    description: 'Anyone can reply to this post',
    icon: 'public',
  },
  {
    value: 'people_i_follow',
    label: 'People I follow',
    description: 'Only people you follow can reply',
    icon: 'group',
  },
  {
    value: 'nobody',
    label: 'Nobody',
    description: 'No one can reply (only you)',
    icon: 'comments_disabled',
  },
];

export const ActivitySettingsModal = forwardRef<ActivitySettingsModalHandle, ActivitySettingsModalProps>(
  ({ initialValue = 'everyone', onSave, onCancel }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [selectedValue, setSelectedValue] = useState<RestrictRepliesValue>(initialValue);

    useEffect(() => {
      setSelectedValue(initialValue);
    }, [initialValue]);

    const open = useCallback(() => {
      setSelectedValue(initialValue);
      dialogRef.current?.showModal();
    }, [initialValue]);

    const close = useCallback(() => {
      dialogRef.current?.close();
    }, []);

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    const handleSave = useCallback(() => {
      onSave(selectedValue);
      close();
    }, [selectedValue, onSave, close]);

    const handleCancel = useCallback(() => {
      setSelectedValue(initialValue);
      close();
      onCancel?.();
    }, [initialValue, close, onCancel]);

    const handleClose = useCallback(() => {
      setSelectedValue(initialValue);
      onCancel?.();
    }, [initialValue, onCancel]);

    return (
      <dialog ref={dialogRef} className="modal" onClose={handleClose}>
        <div className="modal-box w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-primary">settings</span>
              <h3 className="font-bold text-lg">Activity Settings</h3>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleCancel}
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
              Who can reply?
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            {OPTIONS.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <label
                  key={option.value}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl cursor-pointer
                    border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-base-300 hover:border-base-content/30 hover:bg-base-200/50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="restrict_replies"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setSelectedValue(option.value)}
                    className="sr-only"
                  />
                  <span className={`material-symbols-outlined text-xl ${isSelected ? 'text-primary' : 'text-base-content/60'}`}>
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <div className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {option.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Done
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={handleCancel}>close</button>
        </form>
      </dialog>
    );
  }
);

ActivitySettingsModal.displayName = 'ActivitySettingsModal';
