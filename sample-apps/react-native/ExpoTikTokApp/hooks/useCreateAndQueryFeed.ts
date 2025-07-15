import { useUserContext } from '@/contexts/UserContext';
import {
  GetOrCreateFeedRequest,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useEffect, useMemo } from 'react';

export const useCreateAndQueryFeed = ({
  groupId,
  queryOptions,
}: {
  groupId: string;
  queryOptions: GetOrCreateFeedRequest;
}) => {
  const { user } = useUserContext();
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  const feed = useMemo(() => {
    if (!client || !user) {
      return;
    }

    return client.feed(groupId, user.id);
  }, [client, user, groupId]);

  useEffect(() => {
    if (!feed || !connectedUser) {
      return;
    }

    feed.getOrCreate(queryOptions).catch((error) => console.error(error));
  }, [feed, connectedUser, queryOptions]);

  return feed;
};
