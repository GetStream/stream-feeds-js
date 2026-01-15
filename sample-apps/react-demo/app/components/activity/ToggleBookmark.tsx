import { ActivityResponse, useFeedsClient } from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';

export const ToggleBookmark = ({
  activity,
  disabled = false,
}: {
  activity: ActivityResponse;
  disabled?: boolean;
}) => {
  const client = useFeedsClient();

  const toggleBookmark = useCallback(
    () =>
      activity.own_bookmarks?.length > 0
        ? client?.deleteBookmark({
            activity_id: activity.id,
          })
        : client?.addBookmark({
            activity_id: activity.id,
          }),
    [client, activity.id, activity.own_bookmarks],
  );

  return (
    <button
      type="button"
      className={`btn ${
        activity.own_bookmarks?.length > 0 ? 'bg-primary' : ''
      }`}
      disabled={disabled}
      onClick={toggleBookmark}
    >
      <span>⭐️&nbsp;</span>
      {activity.bookmark_count}
    </button>
  );
};
