import { FollowRelationship, StreamFeedClient } from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { PaginatedList } from './PaginatedList';

export const FollowRelationships = ({
  type,
  feed,
  timeline,
}: {
  type: 'followers' | 'following';
  feed: StreamFeedClient;
  timeline?: StreamFeedClient;
}) => {
  const [relationships, setRelationships] = useState<FollowRelationship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [next, setNext] = useState<string | undefined | number>(undefined);

  useEffect(() => {
    void loadMore();
  }, [feed, timeline, type]);

  const loadMore = async () => {
    setIsLoading(true);
    setError(undefined);
    const limit = 30;
    try {
      let newRelationships: FollowRelationship[] = [];
      if (type === 'followers') {
        const offset = (next as number) ?? 0;
        const response = await feed.getFollowingFeeds({ limit, offset });
        newRelationships = response.followers.filter(
          (f) => f.feed.fid !== timeline?.fid,
        );
        setNext(newRelationships.length < limit ? undefined : offset + limit);
      } else if (type === 'following') {
        if (!timeline) {
          throw new Error(
            'Provide timeline if you want to list following relationships',
          );
        }
        const response = await timeline.getFollowedFeeds({
          limit,
          next: next as string | undefined,
        });
        newRelationships = response.followed_feeds.filter(
          (f) => f.feed.fid !== feed.fid,
        );
        setNext(response.next);
      }
      setRelationships([...relationships, ...newRelationships]);
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
      case 'timeline':
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
