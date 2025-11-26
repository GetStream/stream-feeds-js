import {
  ActivityResponse,
  useActivityComments,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-sdk';
import { useState, useEffect, useCallback } from 'react';
import { ToggleFollowButton } from '../ToggleFollowButton';

export const Activity = ({ activity }: { activity: ActivityResponse }) => {
  const client = useFeedsClient();
  const currentUser = useClientConnectedUser();
  const {
    comments = [],
    loadNextPage,
    has_next_page,
  } = useActivityComments({ activity });

  const [commentDraft, setCommentDraft] = useState('');

  // Load initial comments
  useEffect(() => {
    if (comments.length === 0 && activity.comment_count > 0) {
      void loadNextPage({ limit: 5, sort: 'best' });
    }
  }, [loadNextPage, comments.length, activity.comment_count]);

  const toggleReaction = useCallback(() => {
    activity.own_reactions?.length > 0
      ? client?.deleteActivityReaction({
          activity_id: activity.id,
          type: 'like',
        })
      : client?.addActivityReaction({
          activity_id: activity.id,
          type: 'like',
          create_notification_activity: true,
        });
  }, [client, activity.id, activity.own_reactions]);

  const addComment = useCallback(async () => {
    await client?.addComment({
      object_id: activity.id,
      object_type: 'activity',
      comment: commentDraft,
      create_notification_activity: true,
    });
    setCommentDraft('');
  }, [client, activity.id, commentDraft]);

  const toggleBookmark = useCallback(() => {
    activity.own_bookmarks?.length > 0
      ? client?.deleteBookmark({
          activity_id: activity.id,
        })
      : client?.addBookmark({
          activity_id: activity.id,
        });
  }, [client, activity.id, activity.own_bookmarks]);

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
                key={activity.current_feed?.own_follows?.length}
                isFollowing={
                  (activity.current_feed!.own_follows?.length ?? 0) > 0
                }
                userId={activity.current_feed!.created_by.id}
              />
            )}
          </div>
          <p className="w-full">{activity.text}</p>
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <button type="button" className="btn cursor-default">
                💬&nbsp;
                {comments.length}
              </button>
              <button
                type="button"
                className={`btn ${
                  activity.own_reactions?.length > 0 ? 'bg-primary' : ''
                }`}
                onClick={toggleReaction}
              >
                ❤️&nbsp;
                {activity.reaction_groups['like']?.count ?? 0}
              </button>
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
            <div className="w-full flex flex-row gap-2">
              <input
                className="input w-full"
                placeholder="Post your reply"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={addComment}
                disabled={!commentDraft.trim()}
              >
                Reply
              </button>
            </div>
            {comments.map((comment) => (
              <div
                className="flex flex-row items-center gap-2"
                key={comment.id}
              >
                <span className="font-semibold">{comment.user.name}:</span>
                <span>{comment.text}</span>
              </div>
            ))}
            {activity.comment_count > 0 && has_next_page && (
              <button
                className="btn btn-soft btn-primary"
                onClick={() => loadNextPage()}
              >
                Load more comments
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
