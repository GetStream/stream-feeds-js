import type { ActivityResponse } from '@stream-io/feeds-react-sdk';

export const ActivityContent = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  return (
    <>
      <p className="w-full text-md">{activity.text}</p>
      {activity.attachments.length > 0 && (
        <img
          src={activity.attachments[0].image_url}
          alt="Uploaded image"
          className="w-50 h-50 object-cover rounded-lg"
        />
      )}
    </>
  );
};
