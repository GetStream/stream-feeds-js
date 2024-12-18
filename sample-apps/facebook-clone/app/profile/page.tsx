'use client';
import { useEffect, useRef, useState } from 'react';
import { useFeedContext } from '../feed-context';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { Feed } from '@stream-io/feeds-client';
import { FollowRelationships } from '../components/FollowRelationships';

export default function Profile() {
  const { ownFeed, ownTimeline } = useFeedContext();
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
    const unsubscribe = ownFeed?.state.subscribeWithSelector(
      (state) => ({
        follower_count: state.follower_count,
        visibility_level: state.visibility_level,
      }),
      ({ follower_count, visibility_level }) => {
        setFollowerCount(follower_count);
        setVisibilityLevel(visibility_level);
      },
    );

    return unsubscribe;
  }, [ownFeed]);

  useEffect(() => {
    const unsubscribe = ownTimeline?.state.subscribeWithSelector(
      (state) => ({
        following_count: state.following_count,
      }),
      ({ following_count }) => {
        setFollowingCount(following_count);
      },
    );

    return unsubscribe;
  }, [ownTimeline]);

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
    <div>
      <h2 className="text-4xl font-extrabold text-center">Porfile</h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3>
              <b>Followers</b>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {followerCount === undefined ? (
              <LoadingIndicator color="blue"></LoadingIndicator>
            ) : (
              followerCount
            )}
            <button
              onClick={() => {
                setSelectedRelationship('followers');
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
              <b>Following</b>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {followingCount === undefined ? (
              <LoadingIndicator color="blue"></LoadingIndicator>
            ) : (
              followingCount
            )}
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
            {visibilityLevel === undefined ? (
              <LoadingIndicator color="blue"></LoadingIndicator>
            ) : (
              visibilityLevel
            )}
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
            type={selectedRelationship}
          ></FollowRelationships>
        )}
      </dialog>
    </div>
  );
}
