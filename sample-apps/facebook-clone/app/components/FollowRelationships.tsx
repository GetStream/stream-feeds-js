import {
  FollowRelationship,
  StreamFlatFeedClient,
} from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { PaginatedList } from './PaginatedList';

export const FollowRelationships = ({
  type,
  feed,
  timeline,
}: {
  type: 'followers' | 'following';
  feed: StreamFlatFeedClient;
  timeline: StreamFlatFeedClient;
}) => {
  const [relationships, setRelationships] = useState<FollowRelationship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [next, setNext] = useState<number | undefined>(0);

  useEffect(() => {
    void loadMore();
  }, [feed, timeline, type]);

  const loadMore = async () => {
    setIsLoading(true);
    setError(undefined);
    const limit = 30;
    const offset = next ?? 0;
    try {
      let newRelationships: FollowRelationship[] = [];
      if (type === 'followers') {
        const response = await feed.getFollowingFeeds({ limit, offset });
        newRelationships = response.followers.filter(
          (f) => `${f.feed.group}:${f.feed.id}` !== timeline.fid,
        );
      } else if (type === 'following') {
        const response = await timeline.getFollowedFeeds({ limit, offset });
        newRelationships = response.followed_feeds.filter(
          (f) => `${f.feed.group}:${f.feed.id}` !== feed.fid,
        );
      }
      setRelationships([...relationships, ...newRelationships]);
      setNext(newRelationships.length < limit ? undefined : offset + limit);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = (relationship: FollowRelationship) => {
    switch (relationship.feed.group) {
      case 'page':
        return renderPage(relationship);
      case 'user':
        return renderUser(relationship);
      default:
        throw new Error('Not supported feed in feed list');
    }
  };

  const renderUser = (relationship: FollowRelationship) => {
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

  const renderPage = (relationship: FollowRelationship) => {
    return (
      <li
        key={relationship.feed.created_by.id}
        className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
      >
        <div className="flex flex-row items-center gap-1">
          <img
            className="size-10 rounded-full"
            src={relationship.feed.custom?.image}
            alt=""
          />
          <p className="text-sm font-medium text-gray-900">
            {relationship.feed.custom?.name}
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
      error={error}
      itemsName={type === 'followers' ? 'followers' : 'following users'}
    ></PaginatedList>
  );
};
