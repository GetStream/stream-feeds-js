import { FollowRelationship } from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { useFeedContext } from '../feed-context';

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

  return (
    <div>
      {isLoading && relationships.length === 0 && (
        <LoadingIndicator color="blue"></LoadingIndicator>
      )}
      {!isLoading && relationships.length === 0 && <div>No relationships</div>}
      <ul className="divide-y divide-gray-200 overflow-auto">
        {relationships.map((relationship) => (
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
        ))}
      </ul>
      {relationships.length > 0 && next && (
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => loadMore()}
        >
          {isLoading ? <LoadingIndicator></LoadingIndicator> : 'Load more'}
        </button>
      )}
    </div>
  );
};
