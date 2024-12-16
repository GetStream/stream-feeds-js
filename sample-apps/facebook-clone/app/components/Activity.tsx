import { Activity as StreamActivity } from '@stream-io/feeds-client';
import { useState } from 'react';
import { useUserContext } from '../user-context';

export const Activity = ({ activity }: { activity: StreamActivity }) => {
  const [likes] = useState(activity.reaction_groups?.like);
  const { client } = useUserContext();

  const addReaction = () => {
    void client?.feedsSendReaction({ type: 'like', id: activity.id });
  };

  const removeReaction = () => {
    void client?.feedsDeleteReaction({ type: 'like', id: activity.id });
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
        {(likes?.count ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-gray-700 text-sm">
            <span
              className="text-blue-500 material-symbols-outlined fill"
              style={{ fontSize: '22px' }}
            >
              thumb_up
            </span>
            <div>{likes!.count}</div>
          </div>
        )}
        <button
          onClick={() => addReaction()}
          className="text-gray-700 text-sm p-1 border border-gray-300 rounded-md flex items-center gap-1 w-min"
        >
          <span
            className={`text-blue-500 material-symbols-outlined`}
            style={{ fontSize: '22px' }}
          >
            thumb_up
          </span>
          <div>Like</div>
        </button>
      </div>
    </>
  );
};
