import { FollowRelationship } from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { useFeedContext } from '../feed-context';
import { PaginatedList } from './PaginatedList';

export const FollowRelationships = ({
  type,
}: {
  type: 'followers' | 'following';
}) => {
  const [relationships, setRelationships] = useState<FollowRelationship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [next, setNext] = useState<number | undefined>(0);
  const { ownFeed, ownTimeline } = useFeedContext();

  useEffect(() => {
    void loadMore();
  }, [ownFeed, ownTimeline, type]);

  const loadMore = async () => {
    setIsLoading(true);
    const limit = 30;
    const offset = next ?? 0;
    try {
      let newRelationships: FollowRelationship[] = [];
      if (type === 'followers' && ownFeed) {
        const response = await ownFeed.getFollowingFeeds({ limit, offset });
        newRelationships = response.followers;
      } else if (type === 'following' && ownTimeline) {
        const response = await ownTimeline.getFollowedFeeds({ limit, offset });
        newRelationships = response.followed_feeds;
      }
      setRelationships([...relationships, ...newRelationships]);
      setNext(newRelationships.length < limit ? undefined : offset + limit);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = (relationship: FollowRelationship) => {
    return (
      <li
        key={relationship.feed.created_by.id}
        className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
      >
        <div className="flex flex-row items-center gap-1">
          <img
            className="size-10 rounded-full"
            src={relationship.feed.created_by.image}
            alt=""
          />
          <p className="text-sm font-medium text-gray-900">
            {relationship.feed.created_by.name}
          </p>
        </div>
      </li>
    );
  };

  return (
    <PaginatedList
      items={relationships}
      isLoading={isLoading}
      hasNext={!!next}
      renderItem={renderItem}
      onLoadMore={loadMore}
    ></PaginatedList>
  );
};
