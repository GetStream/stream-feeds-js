import {
  checkHasAnotherPage,
  Feed,
  FeedState,
  FollowResponse,
} from '@stream-io/feeds-client';
import { useStateStore } from '@stream-io/feeds-client/react-bindings';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PaginatedList } from './PaginatedList';

export const FollowRelationships = ({
  type,
  feed,
}: {
  type: 'followers' | 'following';
  feed: Feed;
}) => {
  const [error, setError] = useState<Error>();

  const selector = useCallback(
    ({
      followers_pagination,
      followers,
      following_pagination,
      following,
    }: FeedState) => {
      if (type === 'followers') {
        return {
          pagination: followers_pagination,
          follows: followers,
        };
      }

      return {
        pagination: following_pagination,
        follows: following,
      };
    },
    [type],
  );
  const { follows, pagination } = useStateStore(feed.state, selector);

  const rel = useMemo(() => {
    return (
      follows?.filter(
        (f) => f.source_feed.created_by.id !== f.target_feed.created_by.id,
      ) ?? []
    );
  }, [follows]);

  const loadMore = useCallback(async () => {
    setError(undefined);
    try {
      if (type === 'followers') {
        feed.loadNextPageFollowers({
          limit: 30,
        });
      } else if (type === 'following') {
        feed.loadNextPageFollowing({
          limit: 30,
        });
      }
    } catch (e) {
      setError(e as Error);
    }
  }, [feed, type]);

  useEffect(() => {
    if (typeof follows === 'undefined') {
      void loadMore();
    }
  }, [loadMore, follows]);

  const renderItem = (follow: FollowResponse) => {
    const image =
      type === 'followers'
        ? follow.source_feed.created_by.image
        : follow.target_feed.created_by.image;
    const name =
      type === 'followers'
        ? follow.source_feed.created_by.name
        : follow.target_feed.created_by.name;

    return (
      <li
        key={`${follow.source_feed.fid}_${follow.target_feed.fid}`}
        className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
      >
        <div className="flex flex-row items-center gap-1">
          <img className="size-10 rounded-full" src={image} alt="" />
          <p className="text-sm font-medium text-gray-900">{name}</p>
        </div>
      </li>
    );
  };

  return (
    <PaginatedList
      items={rel}
      isLoading={pagination?.loading_next_page ?? false}
      hasNext={checkHasAnotherPage(rel, pagination?.next)}
      renderItem={renderItem}
      onLoadMore={loadMore}
      error={error}
      itemsName={type === 'followers' ? 'followers' : 'following users'}
    />
  );
};
