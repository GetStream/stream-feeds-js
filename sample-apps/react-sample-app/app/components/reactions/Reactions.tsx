import { useUserContext } from '@/app/user-context';
import { ActivityResponse, CommentResponse } from '@stream-io/feeds-client';
import { useRef, useState } from 'react';
import { ReactionsList } from './ReactionsList';
import { useErrorContext } from '@/app/error-context';
import { Dialog } from '../Dialog';

const emojiMapping: Record<string, string> = {
  like: 'favorite',
};

export const Reactions = ({
  type,
  object,
  showCounter,
  canReact,
}: {
  type: string;
  object: ActivityResponse | CommentResponse;
  showCounter: boolean;
  canReact: boolean;
}) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { client } = useUserContext();

  const counts = object.reaction_groups?.[type]?.count ?? 0;
  const hasOwnReaction = !!object.own_reactions?.find((r) => r.type === type);

  const addReaction = async () => {
    const isActivity = !('object_type' in object);
    try {
      await (isActivity
        ? client?.addReaction({ activity_id: object.id, type })
        : client?.addCommentReaction({ comment_id: object.id, type }));
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const removeReaction = async () => {
    const isActivity = !('object_type' in object);
    try {
      await (isActivity
        ? client?.deleteActivityReaction({
            activity_id: object.id,
            type,
          })
        : client?.deleteCommentReaction({ comment_id: object.id, type }));
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
          <div>{counts}</div>
        </button>
      )}
      <Dialog ref={dialogRef}>
        <button className="self-end" onClick={() => closeDialog()}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <ReactionsList type="like" object={object} />
      </Dialog>
    </div>
  );
};
