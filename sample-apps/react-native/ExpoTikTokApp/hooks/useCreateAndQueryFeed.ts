import { useUserContext } from '@/contexts/UserContext';
import {
  GetOrCreateFeedRequest,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useEffect, useMemo } from 'react';

export const useCreateAndQueryFeed = ({
  groupId,
  queryOptions = { watch: true },
  id: idFromProps,
}: {
  groupId: string;
  id?: string;
  queryOptions?: GetOrCreateFeedRequest;
}) => {
  const { user } = useUserContext();
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();
  const id = idFromProps ?? user?.id;

  const feed = useMemo(() => {
    if (!client || !id) {
      return;
    }

    return client.feed(groupId, id);
  }, [client, id, groupId]);

  useEffect(() => {
    if (!feed || !connectedUser || typeof feed.state.getLatestValue().activities !== 'undefined') {
      return;
    }

    feed.getOrCreate(queryOptions).catch((error) => console.error(error));
  }, [feed, connectedUser, queryOptions]);

  return feed;
};
