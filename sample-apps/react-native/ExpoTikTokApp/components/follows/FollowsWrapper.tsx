import { StreamFeed } from '@stream-io/feeds-react-native-sdk';
import { useLocalSearchParams } from 'expo-router';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';
import { PropsWithChildren, useMemo } from 'react';

export const FollowsWrapper = ({ groupId, children }: PropsWithChildren<{ groupId: string }>) => {
  const { userId: userIdParam } = useLocalSearchParams();
  // sigh
  const id = userIdParam as string;

  const config = useMemo(() => ({ groupId, id }), [groupId, id]);

  const feed = useCreateAndQueryFeed(config);

  if (!feed) {
    return null;
  }

  return (
    <StreamFeed feed={feed}>
      {children}
    </StreamFeed>
  );
};
