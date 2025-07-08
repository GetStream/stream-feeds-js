import { useUserContext } from '@/app/user-context';
import { ActivityResponse } from '@stream-io/feeds-client';
import { useRef, useState } from 'react';
import { ReactionsList } from './ReactionsList';
import { useErrorContext } from '@/app/error-context';
import { Dialog } from '../Dialog';

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
  activity: ActivityResponse;
  showCounter: boolean;
  canReact: boolean;
}) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { client } = useUserContext();

  const counts = activity.reaction_groups[type]?.count ?? 0;
  const hasOwnReaction = !!activity.own_reactions.find((r) => r.type === type);

  const addReaction = async () => {
    try {
      await client?.addReaction({ activity_id: activity.id, type });
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const removeReaction = async () => {
    try {
      await client?.deleteActivityReaction({
        activity_id: activity.id,
        type,
      });
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
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
      <Dialog ref={dialogRef}>
        <button className="self-end" onClick={() => closeDialog()}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <ReactionsList type="like" activity={activity} />
      </Dialog>
    </div>
  );
};
