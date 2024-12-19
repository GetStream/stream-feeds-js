import { useUserContext } from '@/app/user-context';
import { Activity } from '@stream-io/feeds-client';
import { useRef, useState } from 'react';
import { ReactionsList } from './ReactionsList';

const emojiMapping: Record<string, string> = {
  like: 'thumb_up',
};

export const Reactions = ({
  type,
  activity,
}: {
  type: string;
  activity: Activity;
}) => {
  const [counts, setCounts] = useState(
    activity.reaction_groups[type]?.count ?? 0,
  );
  const [hasOwnReaction, setHasOwnReaction] = useState(
    !!activity.own_reactions?.find((r) => r.type === type),
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { client } = useUserContext();

  const addReaction = async () => {
    await client?.feedsSendReaction({ type, id: activity.id });
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
    }).catch((err) => console.warn(err));
    setCounts(counts + 1);
    setHasOwnReaction(true);
  };

  const removeReaction = async () => {
    await client?.feedsDeleteReaction({ type, id: activity.id });
    setCounts(counts - 1);
    setHasOwnReaction(false);
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
      <button onClick={() => openDialog()}>
        <div>
          {counts} {type}
          {counts !== 1 ? 's' : ''}
        </div>
      </button>
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
