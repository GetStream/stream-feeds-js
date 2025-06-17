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
  timeline?: Feed;
}) => {
  const { logError } = useErrorContext();

  const { client } = useUserContext();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
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
      timeline?.queryFollowings({
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
            {feed.group === 'user' && (
              <div className="text-lg text-gray-900">
                {/* TODO: change this to be reactive */}
                <b>{feed.currentState.created_by?.name}</b>
              </div>
            )}
            {feed.group === 'page' && (
              <div className="flex flex-col gap-0.5">
                <div className="text-lg text-gray-900">
                  <b>{feed.currentState.custom?.name}</b>
                </div>
                <div className="text-md text-gray-900">
                  {feed.currentState.custom?.description}
                </div>
              </div>
            )}
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
                      setSelectedRelationship('followers');
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
      <dialog
        className={`w-6/12 h-3/6 rounded-lg p-6 bg-white shadow-lg flex flex-col ${isDialogOpen ? '' : 'hidden'}`}
        ref={dialogRef}
      >
        <button className="self-end" onClick={() => closeDialog()}>
          <span className="material-symbols-outlined">close</span>
        </button>
        {isDialogOpen && (
          <FollowRelationships
            feed={feed}
            timeline={timeline}
            type={selectedRelationship}
          />
        )}
      </dialog>
    </>
  );
};
