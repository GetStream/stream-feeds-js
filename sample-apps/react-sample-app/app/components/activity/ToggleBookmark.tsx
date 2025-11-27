import { useErrorContext } from '@/app/error-context';
import { ActivityResponse, useFeedsClient } from '@stream-io/feeds-react-sdk';

export const ToggleBookmark = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const client = useFeedsClient();
  const { logErrorAndDisplayNotification } = useErrorContext();
  const hasOwnBookmark = activity.own_bookmarks?.length > 0;

  const toggleBookmark = async () => {
    try {
      if (hasOwnBookmark) {
        await client?.deleteBookmark({ activity_id: activity.id });
      } else {
        await client?.addBookmark({ activity_id: activity.id });
      }
    } catch (error) {
      logErrorAndDisplayNotification(error);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button className="flex items-center" onClick={() => toggleBookmark()}>
        <span
          className={`material-symbols-outlined ${hasOwnBookmark ? 'fill' : ''}`}
        >
          bookmark
        </span>
      </button>
      <div>{activity.bookmark_count} bookmark(s)</div>
    </div>
  );
};
