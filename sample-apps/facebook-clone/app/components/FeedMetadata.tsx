import { Feed, StreamFlatFeedClient } from '@stream-io/feeds-client';
import { useEffect, useRef, useState } from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { Invite } from './Invite';
import { FollowRelationships } from './FollowRelationships';

export const FeedMetadata = ({
  feed,
  timeline,
}: {
  feed: StreamFlatFeedClient;
  timeline: StreamFlatFeedClient;
}) => {
  const [followerCount, setFollowerCount] = useState<number | undefined>(
    undefined,
  );
  const [followingCount, setFollowingCount] = useState<number | undefined>(
    undefined,
  );
  const [visibilityLevel, setVisibilityLevel] = useState<
    Feed['visibility_level'] | undefined
  >(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedRelationship, setSelectedRelationship] = useState<
    'followers' | 'following'
  >('followers');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const unsubscribe = feed.state.subscribeWithSelector(
      (state) => ({
        follower_count: state.follower_count,
        visibility_level: state.visibility_level,
      }),
      ({ follower_count, visibility_level }) => {
        setFollowerCount((follower_count ?? 1) - 1);
        setVisibilityLevel(visibility_level);
      },
    );

    return unsubscribe;
  }, [feed]);

  useEffect(() => {
    const unsubscribe = timeline.state.subscribeWithSelector(
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
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3>
              <b>Followers</b>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {followerCount === undefined && (
              <LoadingIndicator color="blue"></LoadingIndicator>
            )}
            {followerCount ?? followingCount}
            <button
              onClick={() => {
                setSelectedRelationship('followers');
                openDialog();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md  hover:bg-blue-700 focus:outline-none"
            >
              Show all
            </button>
            {feed && <Invite feed={feed}></Invite>}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3>
              <b>Following</b>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {followingCount === undefined && (
              <LoadingIndicator color="blue"></LoadingIndicator>
            )}
            {followingCount ?? followingCount}
            <button
              onClick={() => {
                setSelectedRelationship('following');
                openDialog();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md  hover:bg-blue-700 focus:outline-none"
            >
              Show all
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3>
              <b>Visibility level</b>
            </h3>
          </div>
          <div>
            {!visibilityLevel && (
              <LoadingIndicator color="blue"></LoadingIndicator>
            )}
            {visibilityLevel && visibilityLevel}
          </div>
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
