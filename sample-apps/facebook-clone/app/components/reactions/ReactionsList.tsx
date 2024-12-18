import { useUserContext } from '@/app/user-context';
import { Activity, ReactionResponse } from '@stream-io/feeds-client';
import { useEffect, useState } from 'react';
import { LoadingIndicator } from '../LoadingIndicator';

export const ReactionsList = ({
  type,
  activity,
}: {
  type: string;
  activity: Activity;
}) => {
  const [reactions, setReactions] = useState<ReactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [next, setNext] = useState<string>();
  const { client } = useUserContext();

  useEffect(() => {
    console.log(client);
    void loadMore();
  }, [client]);

  const loadMore = async () => {
    if (!client) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await client.feedsQueryReactions({
        id: activity.id,
        filter: {
          type,
        },
        next,
        sort: [{ field: 'created_at', direction: -1 }],
      });
      setReactions([...reactions, ...response.reactions]);
      setNext(response.next);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && reactions.length === 0 && (
        <LoadingIndicator color="blue"></LoadingIndicator>
      )}
      {!isLoading && reactions.length === 0 && <div>No reactions</div>}
      <ul className="divide-y divide-gray-200 overflow-auto">
        {reactions.map((reaction) => (
          <li
            key={reaction.user_id}
            className="w-full h-full flex flex-row items-center justify-between gap-1 py-4"
          >
            <div className="flex flex-row items-center gap-1">
              <img
                className="size-10 rounded-full"
                src={reaction.user.image}
                alt=""
              />
              <p className="text-sm font-medium text-gray-900">
                {reaction.user.name}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {reactions.length > 0 && next && (
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          onClick={() => loadMore()}
        >
          {isLoading ? <LoadingIndicator></LoadingIndicator> : 'Load more'}
        </button>
      )}
    </div>
  );
};
