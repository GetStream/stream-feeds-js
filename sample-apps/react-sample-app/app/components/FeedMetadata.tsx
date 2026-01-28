import type { FeedState, Feed } from '@stream-io/feeds-react-sdk';
import {
  FeedOwnCapability,
  useOwnCapabilities,
} from '@stream-io/feeds-react-sdk';
import { useMemo, useRef, useState } from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { FollowRelationships } from './FollowRelationships';
import { FollowStatusButton } from './FollowStatusButton';
import { FeedMenu } from './FeedMenu';
import { useStateStore } from '@stream-io/feeds-react-sdk';
import { Dialog } from './Dialog';

const selector = ({
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
    followStatus: f?.status,
  };
};

export const FeedMetadata = ({
  userFeed,
  timelineFeed,
}: {
  userFeed: Feed;
  timelineFeed: Feed;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<
    'followers' | 'following'
  >('followers');

  const timelineFeedState = useStateStore(timelineFeed?.state, selector);
  const userFeedState = useStateStore(userFeed?.state, selector);

  const followerCount = userFeedState.followerCount;
  const followingCount = timelineFeedState?.followingCount;

  const ownCapabilities = useOwnCapabilities(userFeed);

  const canQueryFollows = useMemo(
    () => ownCapabilities.includes(FeedOwnCapability.QUERY_FOLLOWS),
    [ownCapabilities],
  );

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
                  disabled={!canQueryFollows}
                  className={`no-underline ${canQueryFollows ? 'hover:underline' : ''}`}
                  onClick={() => {
                    setSelectedRelationship('followers');
                    openDialog();
                  }}
                >
                  {`${followerCount} ${followerCount === 1 ? 'follower' : 'followers'}`}
                </button>
              </div>
              {timelineFeed && (
                <div className="text-md">
                  {followingCount === undefined && (
                    <LoadingIndicator color="blue" />
                  )}
                  <button
                    disabled={!canQueryFollows}
                    className={`no-underline ${canQueryFollows ? 'hover:underline' : ''}`}
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
            <FollowStatusButton feed={userFeed} />
          </div>
        </div>
        <FeedMenu />
      </div>
      <Dialog ref={dialogRef}>
        <div className="flex flex-col">
          <button className="self-end" onClick={() => closeDialog()}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <FollowRelationships
            feed={
              selectedRelationship === 'followers' ? userFeed : timelineFeed
            }
            type={selectedRelationship}
          />
        </div>
      </Dialog>
    </>
  );
};
