import { Activity as StreamActivity } from '@stream-io/feeds-client';
import { Reactions } from './reactions/Reactions';
import { useUserContext } from '../user-context';
import { useEffect, useState } from 'react';
import { useErrorContext } from '../error-context';
import { ActivityComposer } from './ActivityComposer';

export const Activity = ({ activity }: { activity: StreamActivity }) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const { user, client } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivityText, setEditedActivityText] = useState('');

  useEffect(() => {
    setCanManage(user?.id === activity.user.id);
  }, [user, activity]);

  const updateActivity = async () => {
    try {
      await client?.updateActivity({
        id: activity.id,
        // TODO: edited_at should be determined by a webhook, not client-side
        custom: { text: editedActivityText, edited_at: Date.now() },
      });
      setIsEditing(false);
    } catch (error) {
      logErrorAndDisplayNotification(
        error as Error,
        `Failed to update post, this could've been a temporary issue, try again`,
      );
    }
  };

  const deleteActivity = async () => {
    try {
      const [feedGroup, feedId] = activity.origin.split(':');
      await client?.removeActivityFromFeed({
        id: feedId,
        group: feedGroup,
        activity_id: activity.id,
      });
      setIsMenuOpen(false);
    } catch (error) {
      logErrorAndDisplayNotification(
        error as Error,
        `Failed to delete post, this could've been a temporary issue, try again`,
      );
    }
  };

  useEffect(() => {
    if (isEditing) {
      setEditedActivityText(activity.custom?.text ?? '');
    }
  }, [isEditing]);

  return (
    <>
      <div className="w-full p-3 border border-gray-300 gap-3 flex flex-col rounded-md">
        <div className="flex items-center gap-1">
          <img
            className="size-12 rounded-full"
            src={activity.user.image}
            alt=""
          />
          <div className="max-w-full w-full min-w-0">
            <b>{activity.user.name}</b>
            <div className="text-sm text-gray-700 flex items-center gap-1">
              <div>{activity.created_at.toLocaleString()}</div>
              {activity.custom?.edited_at && (
                <div>
                  - edited at{' '}
                  {new Date(activity.custom.edited_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          {canManage && (
            <div className="self-start flex items-center gap-1">
              {isEditing && (
                <>
                  <button
                    className="text-green-400 flex"
                    onClick={() => updateActivity()}
                  >
                    <span className="material-symbols-outlined">check</span>
                  </button>
                  <button
                    className="text-red-400 flex"
                    onClick={() => setIsEditing(false)}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </>
              )}
              <div className="relative">
                <button
                  className="text-gray-400 flex"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
                <div
                  className={`absolute rounded-md right-0 w-48 bg-white shadow-lg flex flex-col items-stretch ${isMenuOpen ? '' : 'hidden'}`}
                >
                  <button
                    className="text-gray-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className="material-symbols-outlined">edit</span>
                    <div>Edit</div>
                  </button>

                  <button
                    className="text-red-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
                    onClick={() => deleteActivity()}
                  >
                    <span className="material-symbols-outlined">delete</span>
                    <div>Delete</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {!isEditing && <div>{activity.custom?.text}</div>}
        {isEditing && (
          <ActivityComposer
            text={editedActivityText}
            onChange={(text) => setEditedActivityText(text)}
          ></ActivityComposer>
        )}
        <Reactions type="like" activity={activity} />
      </div>
    </>
  );
};
