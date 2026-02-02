import { StreamFeed, type ActivityResponse } from '@stream-io/feeds-react-sdk';
import { useCallback, useRef, useState } from 'react';
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

  return (
    <>
      <button
        type="button"
        className="group inline-flex items-center gap-1 text-base-content/60 hover:text-primary transition-colors"
        onClick={openDialog}
      >
        <span className="w-9 h-9 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined text-[18px]">repeat</span>
        </span>
        <span className="text-[13px] tabular-nums">{activity.share_count}</span>
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box w-[90%] max-w-xl bg-base-100 rounded-2xl p-0">
          <div className="flex items-center p-4 border-b border-base-content/20">
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
