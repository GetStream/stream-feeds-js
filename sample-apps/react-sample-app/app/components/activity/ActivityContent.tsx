import { ActivityResponse } from '@stream-io/feeds-react-sdk';
import { ActivityComposer } from './ActivityComposer';
import { Poll } from '../Poll';

export const ActivityContent = ({
  activity,
  isEditing,
  updatedText,
  onUpdatedTextChange,
}: {
  activity: ActivityResponse;
  isEditing: boolean;
  updatedText: string;
  onUpdatedTextChange: (text: string) => void;
}) => {
  return (
    <>
      {!isEditing && <div>{activity?.text}</div>}
      {isEditing && (
        <ActivityComposer
          text={updatedText}
          onChange={(text) => onUpdatedTextChange(text)}
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
              <a href={attachment.asset_url} target="_blank" rel="noreferrer">
                File attachment
              </a>
            </div>
          )}
        </div>
      ))}
      {activity.poll ? <Poll activity={activity} /> : null}
    </>
  );
};
