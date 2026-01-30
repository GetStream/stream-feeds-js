import {
  type ActivityResponse,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { startTransition, useCallback, useOptimistic, useState } from 'react';
import { ActionButton } from '../../utility/ActionButton';

export const ToggleBookmark = ({
  activity,
}: {
  activity: ActivityResponse;
}) => {
  const client = useFeedsClient();
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const isBookmarked = (activity.own_bookmarks?.length ?? 0) > 0;
  const bookmarkCount = activity.bookmark_count ?? 0;

  const [state, setState] = useOptimistic(
    { isBookmarked, bookmarkCount },
    (_, newState: { isBookmarked: boolean; bookmarkCount: number }) => newState,
  );

  const toggleBookmark = useCallback(() => {
    setInProgress(true);
    setError(undefined);

    startTransition(async () => {
      try {
        if (isBookmarked) {
          setState({ isBookmarked: false, bookmarkCount: bookmarkCount - 1 });
          await client?.deleteBookmark({
            activity_id: activity.id,
          });
        } else {
          setState({ isBookmarked: true, bookmarkCount: bookmarkCount + 1 });
          await client?.addBookmark({
            activity_id: activity.id,
          });
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setInProgress(false);
      }
    });
  }, [client, activity.id, isBookmarked, bookmarkCount, setState]);

  return (
    <ActionButton
      onClick={toggleBookmark}
      icon="bookmark"
      disabled={inProgress}
      label={state.bookmarkCount.toString()}
      isActive={state.isBookmarked}
      error={error}
    />
  );
};
