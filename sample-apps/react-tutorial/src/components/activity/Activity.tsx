import type { ActivityResponse } from '@stream-io/feeds-react-sdk';
import {
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useCallback } from 'react';
import { ToggleFollowButton } from '../ToggleFollowButton';
import { ToggleReaction } from './ToggleReaction';
import { CommentList } from '../comments/CommentList';
import { CommentComposer } from '../comments/CommentComposer';

export const Activity = ({ activity }: { activity: ActivityResponse }) => {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();

  const toggleBookmark = useCallback(
    () =>
      activity.own_bookmarks?.length > 0
        ? client?.deleteBookmark({
            activity_id: activity.id,
          })
        : client?.addBookmark({
            activity_id: activity.id,
          }),
    [client, activity.id, activity.own_bookmarks],
  );

  return (
    <div className="w-full p-4 bg-base-100 card border border-base-300">
      <div className="w-full flex items-start gap-4">
        <div className="avatar flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary  flex items-center justify-center text-white text-lg font-semibold">
            <span>{activity.user?.name?.[0]}</span>
          </div>
        </div>
        <div className="w-full flex flex-col items-start gap-4">
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-md">{activity.user.name}</span>
            <span className="text-sm text-base-content/80">
              {activity.created_at.toLocaleString()}
            </span>
            {activity.current_feed?.feed !== `user:${currentUser?.id}` && (
              <ToggleFollowButton
                userId={activity.current_feed!.created_by.id}
              />
            )}
          </div>
          <p className="w-full">{activity.text}</p>
          {activity.attachments.length > 0 && (
            <img
              src={activity.attachments[0].image_url}
              alt="Uploaded image"
              className="w-50 h-50 object-cover rounded-lg"
            />
          )}
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <button type="button" className="btn cursor-default">
                💬&nbsp;
                {activity.comment_count}
              </button>
              <ToggleReaction activity={activity} />
              <button
                type="button"
                className={`btn ${
                  activity.own_bookmarks?.length > 0 ? 'bg-primary' : ''
                }`}
                onClick={toggleBookmark}
              >
                <span>⭐️&nbsp;</span>
                {activity.bookmark_count}
              </button>
            </div>
            <CommentComposer activity={activity} />
            <CommentList activity={activity} />
          </div>
        </div>
      </div>
    </div>
  );
};
