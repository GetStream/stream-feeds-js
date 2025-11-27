import {
  useFeedsClient,
  type ActivityResponse,
  type CommentResponse,
  type FeedsReactionResponse,
} from '@stream-io/feeds-react-sdk';
import React, { useCallback, useEffect, useState } from 'react';
import { PaginatedList } from '../PaginatedList';

export const ReactionsList = ({
  type,
  object,
}: {
  type: string;
  object: ActivityResponse | CommentResponse;
}) => {
  const [reactions, setReactions] = useState<FeedsReactionResponse[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [next, setNext] = useState<string>();
  const client = useFeedsClient();

  const loadMore = useCallback(async () => {
    if (!client) {
      return;
    }
    setError(undefined);
    setIsLoading(true);
    try {
      const isActivity = !('object_type' in object);
      const payload = {
        filter: {
          reaction_type: type,
        },
        next,
        sort: [{ field: 'created_at', direction: -1 }],
      };
      const response = await (isActivity
        ? client.queryActivityReactions({
            ...payload,
            activity_id: object.id,
          })
        : client.queryCommentReactions({
            ...payload,
            id: object.id,
          }));
      setReactions([...reactions, ...response.reactions]);
      setNext(response.next);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [object, type, next, client, reactions]);

  useEffect(() => {
    void loadMore();
  }, [client, loadMore]);

  const renderItem = (reaction: FeedsReactionResponse) => {
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
