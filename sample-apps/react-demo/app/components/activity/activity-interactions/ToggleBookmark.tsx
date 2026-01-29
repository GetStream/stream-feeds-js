import {
  type ActivityResponse,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useCallback, useState } from 'react';
import { ActionButton } from '../../utility/ActionButton';

export const ToggleBookmark = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const client = useFeedsClient();
  const [optimisticState, setOptimisticState] = useState<boolean | undefined>(undefined);
  const [optimisticCount, setOptimisticCount] = useState<number | undefined>(undefined);
  const [inProgress, setInProgress] = useState(false);

  const toggleBookmark = useCallback(
    async () => {
      setInProgress(true);
      let request: Promise<unknown> | undefined;

      if (activity.own_bookmarks?.length > 0) {
        setOptimisticState(false);
        setOptimisticCount((activity.bookmark_count ?? 0) - 1);
        request = client?.deleteBookmark({
          activity_id: activity.id,
        });
      } else {
        setOptimisticState(true);
        setOptimisticCount((activity.bookmark_count ?? 0) + 1);
        request = client?.addBookmark({
          activity_id: activity.id,
        });
      }
      try {
        await request;
      } finally {
        setOptimisticState(undefined);
        setOptimisticCount(undefined);
        setInProgress(false);
      }
    },
    [client, activity.id, activity.own_bookmarks, activity.bookmark_count],
  );

  return (
    <ActionButton
      onClick={toggleBookmark}
      icon="bookmark"
      disabled={inProgress}
      label={(optimisticCount ?? activity.bookmark_count ?? 0).toString()}
      isActive={optimisticState ?? (activity.own_bookmarks?.length ?? 0) > 0}
    />
  );
};
