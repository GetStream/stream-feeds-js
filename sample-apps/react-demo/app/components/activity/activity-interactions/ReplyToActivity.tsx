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
        className="btn btn-sm btn-soft"
        onClick={openDialog}
      >
        <span className="material-symbols-outlined text-[1.1rem]! text-base-content/80">
          repeat
        </span>
        <span className="text-sm text-base-content/80">
          {activity.share_count}
        </span>
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box w-[90%] max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Repost</h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={closeDialog}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {isOpen && ownFeed && <StreamFeed feed={ownFeed}>
            <ActivityComposer parent={activity} onSave={closeDialog} />
          </StreamFeed>}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
