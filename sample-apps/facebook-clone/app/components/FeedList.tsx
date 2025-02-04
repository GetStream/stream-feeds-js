'use client';
import { useEffect, useState } from 'react';
import { useUserContext } from '../user-context';
import { useFeedContext } from '../feed-context';
import { StreamFeedClient } from '@stream-io/feeds-client';
import Link from 'next/link';
import { PaginatedList } from '../components/PaginatedList';
import { FollowStatusButton } from './FollowStatusButton';
import { FeedCid, FollowStatus } from '../types';

type FeedFollowerMapping = Record<FeedCid, FollowStatus>;

export default function FeedList({ types }: { types: Array<'user' | 'page'> }) {
  const { client, user } = useUserContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [next, setNext] = useState<string | undefined>(undefined);
  const [feeds, setFeeds] = useState<StreamFeedClient[]>([]);
  const { ownTimeline } = useFeedContext();
  const [followerMapping, setFollowerMapping] = useState<FeedFollowerMapping>(
    {},
  );
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (types.length > 1) {
      setTitle('Feeds');
    } else if (types.length === 1) {
      switch (types[0]) {
        case 'user':
          setTitle('Users');
          break;
        case 'page':
          setTitle('Pages');
          break;
      }
    }
  }, [types]);

  useEffect(() => {
    if (!client || !user || !ownTimeline) {
      return;
    }
    setFollowerMapping({});
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
        limit,
        filter: {
          feed_group: { $in: types },
        },
        next,
      });
      const newFeeds = response.feeds.filter((f) => f.id !== user.id);
      const followedNewFeeds = (
        await ownTimeline.getFollowedFeeds({
          limit,
          filter: newFeeds.map((f) => f.fid),
        })
      ).followed_feeds.map((r) => r.feed);
      newFeeds.forEach((feed) => {
        followerMapping[feed.fid] = followedNewFeeds.find(
          (f) => f.fid === feed.fid,
        )
          ? 'following'
          : 'not-followed';
        if (feed.state.getLatestValue().visibility_level === 'followers') {
          if (
            ownTimeline.state
              .getLatestValue()
              .follow_requests?.pending?.find((r) => r.target_fid === feed.fid)
          ) {
            followerMapping[feed.fid] = 'follow-request-sent';
          }
        }
        if (feed.state.getLatestValue().visibility_level === 'private') {
          if (
            ownTimeline.state
              .getLatestValue()
              .follow_requests?.invites?.find((r) => r.target_fid === feed.fid)
          ) {
            followerMapping[feed.fid] = 'invited';
          } else if (followerMapping[feed.fid] === 'not-followed') {
            followerMapping[feed.fid] = 'needs-invite';
          }
        }
      });
      setFeeds([...feeds, ...newFeeds]);
      setFollowerMapping({ ...followerMapping });
      setNext(response.next);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUser = (feed: StreamFeedClient) => {
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
        <FollowStatusButton
          feed={feed}
          status={followerMapping[feed.fid]}
          onStatusChange={(s) =>
            setFollowerMapping({ ...followerMapping, [feed.fid]: s })
          }
        ></FollowStatusButton>
      </li>
    );
  };

  const renderPage = (feed: StreamFeedClient) => {
    return (
      <li
        key={feed.id}
        className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
      >
        <Link href={'/pages/' + feed.id}>
          <div className="flex flex-row items-center gap-3">
            <img
              className="size-20 rounded-full object-cover"
              src={feed.state.getLatestValue()?.custom?.image}
              alt=""
            />
            <div className="flex flex-col gap-3">
              <p className="text-md font-medium text-gray-900">
                <b>{feed.state.getLatestValue().custom?.name}</b>
              </p>
              <p className="text-sm font-medium text-gray-900">
                {feed.state.getLatestValue().custom?.description}
              </p>
            </div>
          </div>
        </Link>
        <FollowStatusButton
          feed={feed}
          status={followerMapping[feed.fid]}
          onStatusChange={(s) =>
            setFollowerMapping({ ...followerMapping, [feed.fid]: s })
          }
        ></FollowStatusButton>
      </li>
    );
  };

  const renderItem = (feed: StreamFeedClient) => {
    switch (feed.state.getLatestValue().group) {
      case 'page':
        return renderPage(feed);
      case 'user':
        return renderUser(feed);
      default:
        throw new Error('Not supported feed in feed list');
    }
  };

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center">{title}</h2>
      <PaginatedList
        items={feeds}
        isLoading={isLoading}
        hasNext={!!next}
        renderItem={renderItem}
        onLoadMore={loadMore}
        listContainerClassNames="divide-y divide-gray-200"
        itemsName={title.toLowerCase()}
        error={error}
      ></PaginatedList>
    </div>
  );
}
