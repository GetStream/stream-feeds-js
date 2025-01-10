import {
  StreamFeedClient,
  StreamFlatFeedClient,
} from '@stream-io/feeds-client';
import { useEffect, useRef, useState } from 'react';
import { useUserContext } from '../user-context';
import { PaginatedList } from './PaginatedList';
import { useErrorContext } from '../error-context';

type FeedCid = string;

type FollowStatus = 'following' | 'invited' | 'needs-invite';

type FeedFollowerMapping = Record<FeedCid, FollowStatus>;

export const Invite = ({ feed }: { feed: StreamFlatFeedClient }) => {
  const { logError, logErrorAndDisplayNotification } = useErrorContext();
  const [canInvite, setCanInvite] = useState(false);
  const [error, setError] = useState<Error>();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { client, user } = useUserContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [next, setNext] = useState<string | undefined>(undefined);
  const [feeds, setFeeds] = useState<StreamFeedClient[]>([]);
  const [followerMapping, setFollowerMapping] = useState<FeedFollowerMapping>(
    {},
  );

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({ visibility_level: state.visibility_level }),
      ({ visibility_level }) => {
        setCanInvite(visibility_level === 'private');
      },
    );

    return unsubscribe;
  }, [feed]);

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
      setIsDialogOpen(true);
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
      setIsDialogOpen(false);
    }
  };

  const invite = async (timelineFeed: StreamFeedClient) => {
    try {
      await feed.update({
        invited_follow_requests: [timelineFeed.fid],
        max_activity_copy_limit_for_invites: 500,
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
      logErrorAndDisplayNotification(
        error as Error,
        `Failed to send invite to ${timelineFeed.state.getLatestValue().created_by?.name}, this could've been a temporary issue, try again`,
      );
    }
  };

  useEffect(() => {
    setIsLoading(false);
    setFeeds([]);
    setNext(undefined);
    setFollowerMapping({});
  }, [feed]);

  useEffect(() => {
    if (isDialogOpen && feeds.length === 0) {
      void loadMore();
    }
  }, [isDialogOpen]);

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
          // TODO: we should have filter here
        })
      ).followers.map((r) => r.feed);
      newFeeds.forEach((timelineFeed) => {
        followerMapping[timelineFeed.fid] = followingFeeds.find(
          (f) => `${f.group}:${f.id}` === timelineFeed.fid,
        )
          ? 'following'
          : 'needs-invite';
        if (
          timelineFeed.state
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
    <>
      {canInvite && (
        <button
          onClick={() => openDialog()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md  hover:bg-blue-700 focus:outline-none"
        >
          Invite followers
        </button>
      )}
      <dialog
        className={`w-6/12 h-3/6 rounded-lg p-6 bg-white shadow-lg flex flex-col ${isDialogOpen ? '' : 'hidden'}`}
        ref={dialogRef}
      >
        <button className="self-end" onClick={() => closeDialog()}>
          <span className="material-symbols-outlined">close</span>
        </button>
        {isDialogOpen && (
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
    </>
  );
};
