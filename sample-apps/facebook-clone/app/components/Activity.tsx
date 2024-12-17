import { Activity as StreamActivity } from '@stream-io/feeds-client';
import { useState } from 'react';
import { useUserContext } from '../user-context';

export const Activity = ({ activity }: { activity: StreamActivity }) => {
  const [likes, setLikes] = useState(activity.reaction_groups.like?.count ?? 0);
  const [hasOwnLike, setHasOwnLike] = useState(
    !!activity.own_reactions?.find((r) => r.type === 'like'),
  );
  const { client } = useUserContext();

  const addReaction = async () => {
    await client?.feedsSendReaction({ type: 'like', id: activity.id });
    void fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUserId: activity.user.id,
        verb: 'like',
        objectId: activity.id,
      }),
    }).catch((err) => console.warn(err));
    setLikes(likes + 1);
    setHasOwnLike(true);
  };

  const removeReaction = async () => {
    await client?.feedsDeleteReaction({ type: 'like', id: activity.id });
    setLikes(likes - 1);
    setHasOwnLike(false);
  };

  return (
    <>
      <div className="w-full p-3 border border-gray-300 gap-3 flex flex-col rounded-md">
        <div className="flex items-center gap-1">
          <img
            className="size-12 rounded-full"
            src={activity.user.image}
            alt=""
          />
          <div>
            <b>{activity.user.name}</b>
            <div className="text-sm text-gray-700">
              {activity.created_at.toLocaleString()}
            </div>
          </div>
        </div>
        <div>{activity.custom?.text}</div>
        <div className="flex items-center gap-1 text-gray-700 text-sm">
          <button
            onClick={() => (hasOwnLike ? removeReaction() : addReaction())}
          >
            <span
              className={`text-blue-500 material-symbols-outlined ${hasOwnLike ? 'fill' : ''}`}
              style={{ fontSize: '22px' }}
            >
              thumb_up
            </span>
          </button>
          <div>
            {likes} like{likes !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  );
};
