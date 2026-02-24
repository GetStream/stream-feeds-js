import { StreamFeed, type ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useCallback, useRef, useState } from 'react';
import { ActionButton } from '@/app/components/utility/ActionButton';
import { ActivityComposer } from '../ActivityComposer';
import { useOwnFeedsContext } from '@/app/own-feeds-context';

export const ReplyToActivity = ({ activity }: { activity: ActivityResponse }) => {
  const { ownFeed } = useOwnFeedsContext();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = useCallback(() => {
    setIsOpen(true);
    dialogRef.current?.showModal();
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    dialogRef.current?.close();
  }, []);

  const disabled = activity.visibility === 'private' || activity.preview;

  return (
    <>
      <ActionButton
        icon="repeat"
        label={String(activity.share_count)}
        isActive={false}
        disabled={disabled}
        onClick={openDialog}
        activeColor="green"
      />
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box w-[90%] max-w-xl bg-base-100 rounded-2xl p-0">
          <div className="flex items-center p-4 border-b border-base-content/10">
            <button
              className="w-9 h-9 rounded-full hover:bg-base-200 flex items-center justify-center transition-colors"
              onClick={closeDialog}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-4">
            {isOpen && ownFeed && (
              <StreamFeed feed={ownFeed}>
                <ActivityComposer parent={activity} onSave={closeDialog} portalContainer={dialogRef.current} />
              </StreamFeed>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-black/40">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
