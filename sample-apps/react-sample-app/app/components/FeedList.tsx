'use client';
import { useCallback, useEffect, useState } from 'react';
import { Feed, FeedState } from '@stream-io/feeds-client';
import { useStateStore } from '@stream-io/feeds-client/react-bindings';
import Link from 'next/link';

import { useUserContext } from '../user-context';
import { useFeedContext } from '../feed-context';
import { PaginatedList } from '../components/PaginatedList';
import { FollowStatusButton } from './FollowStatusButton';

const selector = (state: FeedState) => {
  return {
    createdBy: state.created_by,
  };
};

const UserItem = ({ feed }: { feed: Feed }) => {
  const { createdBy } = useStateStore(feed.state, selector);

  return (
    <li className="w-full h-full flex flex-row items-center justify-between gap-1 py-4">
      <Link href={'/users/' + feed.id}>
        <div className="flex flex-row items-center gap-1">
          <img className="size-10 rounded-full" src={createdBy?.image} alt="" />
          <p className="text-sm font-medium text-gray-900">
            {createdBy?.name ?? feed.fid}
          </p>
        </div>
      </Link>
      <FollowStatusButton feed={feed}></FollowStatusButton>
    </li>
  );
};

export default function FeedList({ types }: { types: Array<'user'> }) {
  const { client, user } = useUserContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [next, setNext] = useState<string | undefined>(undefined);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const { ownTimeline } = useFeedContext();

  const [title, setTitle] = useState('');

  useEffect(() => {
    if (types.length > 1) {
      setTitle('Feeds');
    } else if (types.length === 1) {
      switch (types[0]) {
        case 'user':
          setTitle('Users');
          break;
      }
    }
  }, [types]);

  const loadMore = useCallback(async () => {
    if (!client || !user || !ownTimeline) {
      return;
    }
    setError(undefined);
    setIsLoading(true);
    const limit = 30;
    try {
      const response = await client.queryFeeds({
        limit,
        filter: {
          group_id: { $in: types },
        },
        next,
      });
      const newFeeds = response.feeds.filter((f) => f.id !== user.id);
      setFeeds([...feeds, ...newFeeds]);
      setNext(response.next);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, feeds, next, ownTimeline, types, user]);

  useEffect(() => {
    if (!client || !user || !ownTimeline) {
      return;
    }
    void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, user, ownTimeline]);

  const renderUser = (feed: Feed) => {
    return <UserItem key={feed.fid} feed={feed} />;
  };

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center">{title}</h2>
      <PaginatedList
        items={feeds}
        isLoading={isLoading}
        hasNext={!!next}
        renderItem={renderUser}
        onLoadMore={loadMore}
        listContainerClassNames="divide-y divide-gray-200"
        itemsName={title.toLowerCase()}
        error={error}
      />
    </div>
  );
}
