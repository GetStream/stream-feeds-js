import { ActivityComposer } from '@/components/ActivityComposer';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StreamFeed,
  useClientConnectedUser,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useMemo } from 'react';

const CreatePostScreen = () => {
  const client = useFeedsClient();
  const connectedUser = useClientConnectedUser();

  const feed = useMemo(
    () =>
      connectedUser?.id ? client?.feed('user', connectedUser.id) : null,
    [connectedUser?.id, client],
  );

  if (!feed) {
    return null;
  }

  return (
      <StreamFeed feed={feed}>
        <ActivityComposer />
      </StreamFeed>
  );
}

export default CreatePostScreen;
