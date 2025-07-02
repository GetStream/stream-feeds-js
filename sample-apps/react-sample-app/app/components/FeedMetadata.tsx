import { FeedOwnCapability, FeedState, Feed } from '@stream-io/feeds-client';
import { useEffect, useRef, useState } from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { FollowRelationships } from './FollowRelationships';
import { useErrorContext } from '../error-context';
import { FollowStatusButton } from './FollowStatusButton';
import { FeedMenu } from './FeedMenu';
import { useStateStore } from '../hooks/useStateStore';
import { useUserContext } from '../user-context';
import { initializeFeed } from '../hooks/initializeFeed';
import { Dialog } from './Dialog';

const selector = ({
  own_capabilities = [],
  follower_count = 0,
  following_count = 0,
  created_by,
  own_follows = [],
}: FeedState) => {
  const f = own_follows.find((_) => _.source_feed.group_id === 'timeline');

  return {
    createdBy: created_by,
    followerCount: follower_count - 1,
    followingCount: following_count - 1,
    canReadFeed: own_capabilities.includes(FeedOwnCapability.READ_FEED),
    canQueryFollows: own_capabilities.includes(FeedOwnCapability.QUERY_FOLLOWS),
    followStatus: f?.status,
  };
};

export const FeedMetadata = ({
  feed,
  timeline,
}: {
  feed: Feed;
  timeline: Feed;
}) => {
  const { logError } = useErrorContext();

  const { client } = useUserContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<
    'followers' | 'following'
  >('followers');

  const timelineFeedState = useStateStore(timeline?.state, selector);
  const userFeedState = useStateStore(feed?.state, selector);

  const followerCount = userFeedState.followerCount;
  const followingCount = timelineFeedState?.followingCount;

  const canQueryFollowers = userFeedState.canQueryFollows;
  const canQueryFollowings = timelineFeedState?.canQueryFollows;

  useEffect(() => {
    if (!timeline || !client) return;

    void initializeFeed(timeline, { watch: true });

    return;

    // eslint-disable-next-line no-unreachable
    Promise.allSettled([
      // followings (everything this person follows)
      timeline?.queryFollowing({
        limit: 10,
      }),
      // followers (everyone who follow this person)
      feed.queryFollowers({
        limit: 10,
      }),
    ])
      .then(([a, b]) => {
        if (a.status === 'fulfilled') {
          console.log(a.value);
        }
        if (b.status === 'fulfilled') {
          console.log(b.value);
        }
      })
      .catch(console.log);
  });

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <div className="flex gap-3">
        <div className="w-full flex gap-3 items-center">
          <img
            className="size-32 rounded-full object-cover"
            src={userFeedState.createdBy?.image}
            alt=""
          />
          <div className="flex flex-col gap-1 items-start">
            <div className="text-lg text-gray-900">
              <b>{userFeedState.createdBy?.name}</b>
            </div>
            <div className="text-md flex gap-3">
              <div className="text-md">
                {followerCount === undefined && (
                  <LoadingIndicator color="blue" />
                )}
                <button
                  disabled={!canQueryFollowers}
                  className={`no-underline ${canQueryFollowers ? 'hover:underline' : ''}`}
                  onClick={() => {
                    setSelectedRelationship('followers');
                    openDialog();
                  }}
                >
                  {`${followerCount} ${followerCount === 1 ? 'follower' : 'followers'}`}
                </button>
              </div>
              {timeline && (
                <div className="text-md">
                  {followingCount === undefined && (
                    <LoadingIndicator color="blue" />
                  )}
                  <button
                    disabled={!canQueryFollowings}
                    className={`no-underline ${canQueryFollowings ? 'hover:underline' : ''}`}
                    onClick={() => {
                      setSelectedRelationship('following');
                      openDialog();
                    }}
                  >
                    {`${followingCount} following`}
                  </button>
                </div>
              )}
            </div>
            <FollowStatusButton feed={feed} />
          </div>
        </div>
        <FeedMenu feed={feed} />
      </div>
      <Dialog ref={dialogRef}>
        <div className="flex flex-col">
          <button className="self-end" onClick={() => closeDialog()}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <FollowRelationships
            feed={selectedRelationship === 'followers' ? feed : timeline}
            type={selectedRelationship}
          />
        </div>
      </Dialog>
    </>
  );
};
