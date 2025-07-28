import React, { useState } from 'react';
import { useFeedActivities } from '@stream-io/feeds-react-native-sdk';
import { ActivitySectionList } from '@/components/ActivitySectionList';
import { useStableCallback } from '@/hooks/useStableCallback';

export const Feed = () => {
  const [error, setError] = useState<Error | undefined>();
  const { loadNextPage, is_loading, activities, has_next_page } = useFeedActivities() ?? {};

  const getNextPage = useStableCallback(async () => {
    setError(undefined);
    loadNextPage().catch(setError);
  });

  return (
    <ActivitySectionList
      activities={activities}
      is_loading={is_loading}
      loadNextPage={getNextPage}
      has_next_page={has_next_page}
      error={error}
    />
  );
};
