import { useUserContext } from '@/app/user-context';
import { Activity } from '@stream-io/feeds-client';
import { useEffect, useRef, useState } from 'react';
import { ReactionsList } from './ReactionsList';
import { useErrorContext } from '@/app/error-context';

const emojiMapping: Record<string, string> = {
  like: 'thumb_up',
  dislike: 'thumb_down',
};

export const Reactions = ({
  type,
  activity,
  showCounter,
  canReact,
}: {
  type: string;
  activity: Activity;
  showCounter: boolean;
  canReact: boolean;
}) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  const [counts, setCounts] = useState(0);
  const [hasOwnReaction, setHasOwnReaction] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { client } = useUserContext();

  useEffect(() => {
    setCounts(activity.reaction_groups[type]?.count ?? 0);
    setHasOwnReaction(!!activity.own_reactions.find((r) => r.type === type));
  }, [activity, type]);

  const addReaction = async () => {
    try {
      await client?.addReactionToActivity({
        type,
        id: activity.id,
        enforce_unique: true,
      });
      void fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: activity.user.id,
          verb: type,
          objectId: activity.id,
        }),
      }).catch((err) => logError(err));
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const removeReaction = async () => {
    try {
      await client?.deleteReactionFromActivity({ type, id: activity.id });
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
      setIsDialogOpen(true);
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-1 text-gray-700 text-sm">
      {canReact && (
        <button
          className="flex"
          onClick={() => (hasOwnReaction ? removeReaction() : addReaction())}
        >
          <span
            className={`text-blue-500 material-symbols-outlined ${hasOwnReaction ? 'fill' : ''}`}
            style={{ fontSize: '22px' }}
          >
            {emojiMapping[type]}
          </span>
        </button>
      )}
      {!canReact && showCounter && (
        <span
          className={`text-blue-500 material-symbols-outlined ${hasOwnReaction ? 'fill' : ''}`}
          style={{ fontSize: '22px' }}
        >
          {emojiMapping[type]}
        </span>
      )}
      {showCounter && (
        <button onClick={() => openDialog()}>
          <div>
            {counts} {type}
            {counts !== 1 ? 's' : ''}
          </div>
        </button>
      )}
      <dialog
        className={`w-6/12 h-3/6 rounded-lg p-6 bg-white shadow-lg flex flex-col ${isDialogOpen ? '' : 'hidden'}`}
        ref={dialogRef}
      >
        <button className="self-end" onClick={() => closeDialog()}>
          <span className="material-symbols-outlined">close</span>
        </button>
        {isDialogOpen && (
          <ReactionsList type="like" activity={activity}></ReactionsList>
        )}
      </dialog>
    </div>
  );
};
