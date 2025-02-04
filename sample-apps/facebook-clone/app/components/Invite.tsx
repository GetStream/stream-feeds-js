import { StreamFeedClient } from '@stream-io/feeds-client';
import { useEffect, useRef, useState } from 'react';
import { useUserContext } from '../user-context';
import { PaginatedList } from './PaginatedList';
import { useErrorContext } from '../error-context';

type FeedCid = string;

type FollowStatus = 'following' | 'invited' | 'needs-invite';

type FeedFollowerMapping = Record<FeedCid, FollowStatus>;

export const Invite = ({
  feed,
  open,
  onOpenChange,
}: {
  feed: StreamFeedClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  const [error, setError] = useState<Error>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { client, user } = useUserContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [next, setNext] = useState<string | undefined>(undefined);
  const [feeds, setFeeds] = useState<StreamFeedClient[]>([]);
  const [followerMapping, setFollowerMapping] = useState<FeedFollowerMapping>(
    {},
  );

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [open]);

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
      setFeeds([]);
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (open && feeds.length === 0) {
      void loadMore();
    }
  }, [open]);

  const invite = async (timelineFeed: StreamFeedClient) => {
    try {
      await feed.update({
        invited_follow_requests: [timelineFeed.fid],
        max_activity_copy_limit_for_invites: 1000,
      });
      setFollowerMapping({ ...followerMapping, [timelineFeed.fid]: 'invited' });
      void fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: timelineFeed.state.getLatestValue().created_by?.id,
          verb: 'invite',
          objectId: feed.fid,
        }),
      }).catch((err) => logError(err));
    } catch (error) {
      logErrorAndDisplayNotification(error as Error, (error as Error).message);
    }
  };

  useEffect(() => {
    setIsLoading(false);
    setFeeds([]);
    setNext(undefined);
    setFollowerMapping({});
  }, [feed]);

  const loadMore = async () => {
    if (!client || !user || !feed) {
      return;
    }
    setError(undefined);
    setIsLoading(true);
    const limit = 30;
    const response = await client.queryFeeds({
      limit,
      filter: {
        feed_group: 'timeline',
      },
      next,
    });
    const newFeeds = response.feeds.filter((f) => f.id !== user.id);
    try {
      const followingFeeds = (
        await feed.getFollowingFeeds({
          offset: 0,
          limit,
          filter: newFeeds.map((f) => f.fid),
        })
      ).followers.map((r) => r.feed);
      newFeeds.forEach((timelineFeed) => {
        followerMapping[timelineFeed.fid] = followingFeeds.find(
          (f) => `${f.group}:${f.id}` === timelineFeed.fid,
        )
          ? 'following'
          : 'needs-invite';
        if (
          feed.state
            .getLatestValue()
            .follow_requests?.invites?.find(
              (r) => r.source_fid === timelineFeed.fid,
            )
        ) {
          followerMapping[timelineFeed.fid] = 'invited';
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

  const renderItem = (timelineFeed: StreamFeedClient) => {
    return (
      <li
        key={timelineFeed.id}
        className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
      >
        <div className="flex flex-row items-center gap-1">
          <img
            className="size-10 rounded-full"
            src={timelineFeed.state.getLatestValue().created_by?.image}
            alt=""
          />
          <p className="text-sm font-medium text-gray-900">
            {timelineFeed.state.getLatestValue().created_by?.name}
          </p>
        </div>
        {followerMapping[timelineFeed.fid] === 'needs-invite' && (
          <button
            onClick={() => invite(timelineFeed)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Invite
          </button>
        )}
        {followerMapping[timelineFeed.fid] === 'invited' && 'Invited'}
        {followerMapping[timelineFeed.fid] === 'following' && 'Following'}
      </li>
    );
  };

  return (
    <dialog
      className={`w-6/12 h-3/6 rounded-lg p-6 bg-white shadow-lg flex flex-col ${open ? '' : 'hidden'}`}
      ref={dialogRef}
    >
      <button className="self-end" onClick={() => closeDialog()}>
        <span className="material-symbols-outlined">close</span>
      </button>
      {open && (
        <div>
          <h2 className="text-4xl font-extrabold text-center">Users</h2>
          <PaginatedList
            items={feeds}
            isLoading={isLoading}
            hasNext={!!next}
            renderItem={renderItem}
            onLoadMore={loadMore}
            error={error}
            itemsName="users"
          ></PaginatedList>
        </div>
      )}
    </dialog>
  );
};
