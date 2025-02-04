import { StreamFeedClient } from '@stream-io/feeds-client';
import { useEffect, useRef, useState } from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { FollowRelationships } from './FollowRelationships';
import { useFeedContext } from '../feed-context';
import { FollowStatus } from '../types';
import { useErrorContext } from '../error-context';
import { FollowStatusButton } from './FollowStatusButton';

export const FeedMetadata = ({
  feed,
  timeline,
}: {
  feed: StreamFeedClient;
  timeline?: StreamFeedClient;
}) => {
  const { logError } = useErrorContext();

  const [followerCount, setFollowerCount] = useState<number | undefined>(
    undefined,
  );
  const [followingCount, setFollowingCount] = useState<number | undefined>(
    undefined,
  );
  const { ownTimeline } = useFeedContext();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedRelationship, setSelectedRelationship] = useState<
    'followers' | 'following'
  >('followers');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus | undefined>(
    undefined,
  );

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({
        follower_count: state.follower_count,
      }),
      ({ follower_count }) => {
        setFollowerCount(
          feed.group === 'page'
            ? (follower_count ?? 0)
            : (follower_count ?? 1) - 1,
        );
      },
    );

    return unsubscribe;
  }, [feed]);

  useEffect(() => {
    if (timeline?.fid !== ownTimeline?.fid) {
      if (
        ownTimeline?.state
          .getLatestValue()
          .follow_requests?.pending.find((f) => f.target_fid === feed.fid)
      ) {
        setFollowStatus('follow-request-sent');
      } else if (
        ownTimeline?.state
          .getLatestValue()
          .follow_requests?.invites?.find((f) => f.target_fid === feed.fid)
      ) {
        setFollowStatus('invited');
      } else {
        ownTimeline
          ?.getFollowedFeeds({ filter: [feed.fid] })
          .then((response) => {
            if (response.followed_feeds.length === 0) {
              setFollowStatus(
                feed.state.getLatestValue().visibility_level === 'private'
                  ? 'needs-invite'
                  : 'not-followed',
              );
            } else {
              setFollowStatus('following');
            }
          })
          .catch((e) => logError(e));
      }
    } else {
      setFollowStatus(undefined);
    }
  }, [timeline, ownTimeline, feed]);

  useEffect(() => {
    const unsubscribe = timeline?.state.subscribeWithSelector(
      (state) => ({
        following_count: state.following_count,
      }),
      ({ following_count }) => {
        setFollowingCount((following_count ?? 1) - 1);
      },
    );

    return unsubscribe;
  }, [timeline]);

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
      <div className="flex gap-3 items-center">
        <img
          className="size-32 rounded-full object-cover"
          src={
            feed.group === 'user'
              ? feed.state.getLatestValue().created_by?.image
              : feed.state.getLatestValue().custom?.image
          }
          alt=""
        />
        <div className="flex flex-col gap-1">
          {feed.group === 'user' && (
            <div className="text-lg text-gray-900">
              <b>{feed.state.getLatestValue().created_by?.name}</b>
            </div>
          )}
          {feed.group === 'page' && (
            <div className="flex flex-col gap-0.5">
              <div className="text-lg text-gray-900">
                <b>{feed.state.getLatestValue().custom?.name}</b>
              </div>
              <div className="text-md text-gray-900">
                {feed.state.getLatestValue().custom?.description}
              </div>
            </div>
          )}
          <div className="text-md flex gap-3">
            <div className="text-md">
              {followerCount === undefined && (
                <LoadingIndicator color="blue"></LoadingIndicator>
              )}
              <button
                className="no-underline hover:underline"
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
                  <LoadingIndicator color="blue"></LoadingIndicator>
                )}
                <button
                  className="no-underline hover:underline"
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
          {followStatus && (
            <FollowStatusButton
              feed={feed}
              status={followStatus}
              onStatusChange={(newStatus) => {
                if (newStatus === 'following') {
                  setFollowerCount((followerCount ?? 0) + 1);
                } else if (
                  followStatus === 'following' &&
                  newStatus === 'not-followed'
                ) {
                  setFollowerCount((followerCount ?? 0) - 1);
                }
                setFollowStatus(newStatus);
              }}
            ></FollowStatusButton>
          )}
        </div>
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
          ></FollowRelationships>
        )}
      </dialog>
    </>
  );
};
