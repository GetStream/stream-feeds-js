import { useErrorContext } from '@/app/error-context';
import {
  ActivityResponse,
  FeedOwnCapability,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useState } from 'react';

export const ActivityActions = ({
  activity,
  ownCapabilities,
  updatedText,
  onEditStart,
  onEditCancel,
}: {
  activity: ActivityResponse;
  ownCapabilities: readonly FeedOwnCapability[];
  updatedText: string;
  onEditStart: () => void;
  onEditCancel: () => void;
}) => {
  const { logErrorAndDisplayNotification } = useErrorContext();
  const user = useClientConnectedUser();
  const client = useFeedsClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const canEdit =
    ownCapabilities.includes(FeedOwnCapability.UPDATE_ANY_ACTIVITY) ||
    (ownCapabilities.includes(FeedOwnCapability.UPDATE_OWN_ACTIVITY) &&
      activity.user.id === user?.id);
  const canDelete =
    ownCapabilities.includes(FeedOwnCapability.DELETE_ANY_ACTIVITY) ||
    (ownCapabilities.includes(FeedOwnCapability.DELETE_OWN_ACTIVITY) &&
      activity.user.id === user?.id);

  const deleteActivity = async () => {
    try {
      await client?.deleteActivity({
        id: activity.id,
      });
      setIsMenuOpen(false);
    } catch (error) {
      logErrorAndDisplayNotification(error);
    }
  };

  const updateActivity = async () => {
    try {
      await client?.updateActivityPartial({
        id: activity.id,
        set: {
          text: updatedText,
        },
      });
      setIsEditing(false);
    } catch (error) {
      logErrorAndDisplayNotification(error);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    onEditStart();
  };

  const cancelEditing = () => {
    setIsEditing(false);
    onEditCancel();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/activity/${activity.id}`,
    );
  };

  return (
    <>
      <div className="self-start flex items-center gap-1">
        {isEditing && (
          <>
            <button className="text-green-400 flex" onClick={updateActivity}>
              <span className="material-symbols-outlined">check</span>
            </button>
            <button className="text-red-400 flex" onClick={cancelEditing}>
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
                copyLink();
                setIsMenuOpen(false);
              }}
            >
              <span className="material-symbols-outlined">share</span>
              <div>Copy link</div>
            </button>
            {canEdit && (
              <button
                className="text-gray-700 flex gap-1 p-3 items-center rounded-md hover:bg-gray-100"
                onClick={() => {
                  startEditing();
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
    </>
  );
};
