import {
  ActivityResponse,
  Feed,
  FeedOwnCapability,
} from '@stream-io/feeds-react-sdk';
import { Reactions } from '../reactions/Reactions';
import { useEffect, useRef, useState } from 'react';
import { Dialog } from '../Dialog';
import { ActivityCommentSection } from '../comments/ActivityCommentSection';
import { ActivityMetadata } from './ActivityMetadata';
import { ActivityContent } from './ActivityContent';
import { ActivityActions } from './ActivityActions';
import { ToggleBookmark } from './ToggleBookmark';

export const Activity = ({
  activity,
  ownCapabilities,
  feed,
}: {
  feed: Feed;
  activity: ActivityResponse;
  ownCapabilities: readonly FeedOwnCapability[];
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editedActivityText, setEditedActivityText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const canSendReaction = ownCapabilities.includes(
    FeedOwnCapability.ADD_ACTIVITY_REACTION,
  );

  useEffect(() => {
    if (isEditing) {
      setEditedActivityText(activity?.text ?? '');
    }
  }, [activity, isEditing]);

  return (
    <>
      <div className="w-full p-3 border border-gray-300 gap-3 flex flex-col rounded-md">
        <div className="flex items-center gap-1">
          <ActivityMetadata activity={activity} />
          <ActivityActions
            activity={activity}
            ownCapabilities={ownCapabilities}
            updatedText={editedActivityText}
            onEditStart={() => setIsEditing(true)}
            onEditCancel={() => setIsEditing(false)}
          />
        </div>
        <ActivityContent
          activity={activity}
          isEditing={isEditing}
          updatedText={editedActivityText}
          onUpdatedTextChange={setEditedActivityText}
        />
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Reactions
              type="like"
              object={activity}
              canReact={canSendReaction}
              showCounter={true}
            />
          </div>

          <div className="flex items-center gap-1 text-sm px-1">
            <ToggleBookmark activity={activity} />
            <button onClick={() => dialogRef.current?.showModal()}>
              view comments ({activity.comment_count})
            </button>
          </div>
        </div>
      </div>

      <Dialog ref={dialogRef}>
        <ActivityCommentSection feed={feed} activity={activity} />
      </Dialog>
    </>
  );
};
