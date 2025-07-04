import {
  ActivityResponse,
  Feed,
  FeedOwnCapability,
} from '@stream-io/feeds-client';
import { Reactions } from './reactions/Reactions';
import { useUserContext } from '../user-context';
import { useEffect, useRef, useState } from 'react';
import { useErrorContext } from '../error-context';
import { ActivityComposer } from './ActivityComposer';
import Link from 'next/link';
import { Dialog } from './Dialog';
import { ActivityCommentSection } from './comments/ActivityCommentSection';
import { Poll } from '@/app/components/Poll';

export const Activity = ({
  activity,
  ownCapabilities,
  feed,
}: {
  feed: Feed;
  activity: ActivityResponse;
  ownCapabilities: string[];
}) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const { client } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivityText, setEditedActivityText] = useState('');

  const dialogRef = useRef<HTMLDialogElement>(null);

  const canEdit = ownCapabilities.includes(FeedOwnCapability.UPDATE_ACTIVITY);
  const canDelete = ownCapabilities.includes(FeedOwnCapability.REMOVE_ACTIVITY);
  const canSendReaction = ownCapabilities.includes(
    FeedOwnCapability.ADD_ACTIVITY_REACTION,
  );

  const updateActivity = async () => {
    try {
      await client?.updateActivity({
        activity_id: activity.id,
        text: editedActivityText,
      });
      setIsEditing(false);
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  const deleteActivity = async () => {
    try {
      await client?.deleteActivity({
        activity_id: activity.id,
      });
      setIsMenuOpen(false);
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  useEffect(() => {
    if (isEditing) {
      setEditedActivityText(activity?.text ?? '');
    }
  }, [isEditing]);

  return (
    <>
      <div className="w-full p-3 border border-gray-300 gap-3 flex flex-col rounded-md">
        <div className="flex items-center gap-1">
          <Link href={'/users/' + activity.user.id}>
            <img
              className="w-16 rounded-full"
              src={activity.user.image}
              alt=""
            />
          </Link>
          <div className="max-w-full w-full min-w-0">
            <Link href={'/users/' + activity.user.id}>
              <b>{activity.user.name}</b>
            </Link>
            <div className="text-sm text-gray-700 flex items-center gap-1">
              <div>{activity.created_at.toLocaleString()}</div>
              {activity.edited_at && (
                <div>
                  - edited at {new Date(activity.edited_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          {(canEdit || canDelete) && (
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
                  {canEdit && (
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
                  )}

                  {canDelete && (
                    <button
                      className="text-red-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
                      onClick={() => deleteActivity()}
                    >
                      <span className="material-symbols-outlined">delete</span>
                      <div>Delete</div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {!isEditing && <div>{activity?.text}</div>}
        {isEditing && (
          <ActivityComposer
            text={editedActivityText}
            onChange={(text) => setEditedActivityText(text)}
          />
        )}
        {activity.attachments?.map((attachment, index) => (
          <div key={`activity-attachment-${activity.id}-${index}`}>
            {attachment.type === 'image' && (
              <img className="max-h-48" src={attachment.image_url} alt="" />
            )}
            {attachment.type === 'file' && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined">attach_file</span>
                <a href={attachment.asset_url} target="_blank">
                  File attachment
                </a>
              </div>
            )}
          </div>
        ))}
        {activity.poll ? <Poll activity={activity} /> : null}
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Reactions
              type="dislike"
              activity={activity}
              canReact={canSendReaction}
              showCounter={false}
            />
            <Reactions
              type="like"
              activity={activity}
              canReact={canSendReaction}
              showCounter={true}
            />
          </div>

          <button
            onClick={() => dialogRef.current?.showModal()}
            className="text-sm px-1"
          >
            view comments ({activity.comment_count})
          </button>
        </div>
      </div>

      <Dialog ref={dialogRef}>
        <ActivityCommentSection feed={feed} activity={activity} />
      </Dialog>
    </>
  );
};
