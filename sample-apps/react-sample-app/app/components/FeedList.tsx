'use client';
import { useEffect, useState } from 'react';
import { useUserContext } from '../user-context';
import { useFeedContext } from '../feed-context';
import { Feed } from '@stream-io/feeds-client';
import Link from 'next/link';
import { PaginatedList } from '../components/PaginatedList';
import { FollowStatusButton } from './FollowStatusButton';

export default function FeedList({ types }: { types: Array<'user' | 'page'> }) {
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

  useEffect(() => {
    if (!client || !user || !ownTimeline) {
      return;
    }
    void loadMore();
  }, [client, user, ownTimeline]);

  const loadMore = async () => {
    if (!client || !user || !ownTimeline) {
      return;
    }
    setError(undefined);
    setIsLoading(true);
    const limit = 30;
    try {
      const response = await client.queryFeeds({
        // limit,
        // filter: {
        //   feed_group: { $in: types },
        // },
        // next,
      });
      const newFeeds = response.feeds.filter((f) => f.id !== user.id);
      setFeeds([...feeds, ...newFeeds]);
      setNext(response.next);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUser = (feed: Feed) => {
    return (
      <li
        key={feed.id}
        className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
      >
        <Link href={'/users/' + feed.id}>
          <div className="flex flex-row items-center gap-1">
            <img
              className="size-10 rounded-full"
              src={feed.state.getLatestValue().created_by?.image}
              alt=""
            />
            <p className="text-sm font-medium text-gray-900">
              {feed.state.getLatestValue().created_by?.name}
            </p>
          </div>
        </Link>
        <FollowStatusButton feed={feed}></FollowStatusButton>
      </li>
    );
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
      ></PaginatedList>
    </div>
  );
}
