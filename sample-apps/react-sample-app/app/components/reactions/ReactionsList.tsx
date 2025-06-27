import { useUserContext } from '@/app/user-context';
import {
  ActivityReactionResponse,
  ActivityResponse,
  Reaction,
} from '@stream-io/feeds-client';
import React, { useEffect, useState } from 'react';
import { PaginatedList } from '../PaginatedList';

// TODO: Migrate to new API
export const ReactionsList = ({
  type,
  activity,
}: {
  type: string;
  activity: ActivityResponse;
}) => {
  const [reactions, setReactions] = useState<ActivityReactionResponse[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [next, setNext] = useState<string>();
  const { client } = useUserContext();

  useEffect(() => {
    void loadMore();
  }, [client]);

  const loadMore = async () => {
    if (!client) {
      return;
    }
    setError(undefined);
    setIsLoading(true);
    try {
      // TODO: no endpoint for this
      const response: {
        next: string;
        reactions: ActivityReactionResponse[];
      } = { next: '', reactions: [] };
      // await client.queryReactions({
      //   id: activity.id,
      //   filter: {
      //     type,
      //   },
      //   next,
      //   sort: [{ field: 'created_at', direction: -1 }],
      // });
      setReactions([...reactions, ...response.reactions]);
      setNext(response.next);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = (reaction: ActivityReactionResponse) => {
    return (
      <li
        key={reaction.user.id}
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
    );
  };

  return (
    <PaginatedList
      items={reactions}
      isLoading={isLoading}
      hasNext={!!next}
      onLoadMore={loadMore}
      renderItem={renderItem}
      error={error}
      itemsName="reactions"
    ></PaginatedList>
  );
};
