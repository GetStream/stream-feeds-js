import {
  type ActivityResponse,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';
import { ActionButton } from '../../utility/ActionButton';

export const ToggleBookmark = ({
  activity,
}: {
  activity: ActivityResponse;
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
    <ActionButton
      onClick={toggleBookmark}
      icon="bookmark"
      label={activity.bookmark_count.toString()}
      isActive={activity.own_bookmarks?.length > 0}
    />
  );
};
