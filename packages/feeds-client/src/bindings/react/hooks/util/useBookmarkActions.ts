import { useMemo } from 'react';
import type { ActivityResponse } from '@self';
import { useFeedsClient } from '../../contexts/StreamFeedsContext';
import { useStableCallback } from '../internal';

/**
 * A utility hook that takes in an entity and creates bookmark actions
 * that can then be used on the UI. The entity is expected to be an ActivityResponse.
 * @param entity - The entity to which we want to apply reaction actions, expects an ActivityResponse.
 */
export const useBookmarkActions = ({
  entity,
}: {
  entity: ActivityResponse;
}) => {
  const client = useFeedsClient();

  const hasOwnBookmark = entity.own_bookmarks?.length > 0;

  const addBookmark = useStableCallback(async () => {
    await client?.addBookmark({ activity_id: entity.id });
  });

  const removeBookmark = useStableCallback(async () => {
    await client?.deleteBookmark({ activity_id: entity.id });
  });

  const toggleBookmark = useStableCallback(async () => {
    if (hasOwnBookmark) {
      await removeBookmark();
    } else {
      await addBookmark();
    }
  });

  return useMemo(
    () => ({ addBookmark, removeBookmark, toggleBookmark }),
    [addBookmark, removeBookmark, toggleBookmark],
  );
};
