import { ActivityResponse, Feed as StreamFeed } from '@stream-io/feeds-react-sdk';
import { useState } from 'react';
import { Activity } from './Activity';
import { PaginatedList } from './PaginatedList';
import { useStateStore } from '@stream-io/feeds-react-sdk';

export const Feed = ({ feed }: { feed: StreamFeed }) => {
  const [error, setError] = useState<Error>();

  const {
    hasNextPage,
    isLoading,
    activities,
    ownCapabilities = [],
  } = useStateStore(feed.state, (state) => ({
    isLoading: state.is_loading_activities,
    hasNextPage: typeof state.next !== 'undefined',
    activities: state.activities ?? [],
    ownCapabilities: state.own_capabilities,
  }));

  const getNextPage = () => {
    setError(undefined);
    feed.getNextPage().catch(setError);
  };

  const renderItem = (activity: ActivityResponse) => {
    return (
      <li className="w-full" key={activity.id}>
        <Activity
          feed={feed}
          activity={activity}
          ownCapabilities={ownCapabilities}
        />
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
