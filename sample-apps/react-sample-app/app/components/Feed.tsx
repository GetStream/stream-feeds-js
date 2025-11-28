import type {
  ActivityResponse} from '@stream-io/feeds-react-sdk';
import {
  useFeedContext,
  useOwnCapabilities,
} from '@stream-io/feeds-react-sdk';
import { useState } from 'react';
import { Activity } from './activity/Activity';
import { PaginatedList } from './PaginatedList';
import { useStateStore } from '@stream-io/feeds-react-sdk';

export const Feed = () => {
  const [error, setError] = useState<Error>();
  const feed = useFeedContext();

  const { hasNextPage, isLoading, activities } = useStateStore(
    feed?.state,
    (state) => ({
      isLoading: state.is_loading_activities,
      hasNextPage: typeof state.next !== 'undefined',
      activities: state.activities ?? [],
    }),
  ) ?? {
    hasNextPage: false,
    isLoading: false,
    activities: [],
  };

  const ownCapabilities = useOwnCapabilities();

  const getNextPage = () => {
    setError(undefined);
    feed?.getNextPage().catch(setError);
  };

  const renderItem = (activity: ActivityResponse) => {
    return (
      <li className="w-full" key={activity.id}>
        <Activity activity={activity} ownCapabilities={ownCapabilities} />
      </li>
    );
  };

  return (
    <PaginatedList
      items={activities}
      isLoading={isLoading}
      hasNext={hasNextPage}
      renderItem={renderItem}
      onLoadMore={getNextPage}
      error={error}
      itemsName="posts"
    />
  );
};
