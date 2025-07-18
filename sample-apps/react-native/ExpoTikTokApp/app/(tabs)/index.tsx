import { Feed } from '@/components/Feed';
import { StyleSheet, View } from 'react-native';
import { ConnectionLostHeader } from '@/components/ConnectionLostHeader';
import { useCreateAndQueryFeed } from '@/hooks/useCreateAndQueryFeed';
import { StreamFeed } from '@stream-io/feeds-react-native-sdk';

const createFeedConfig = {
  groupId: 'timeline',
  queryOptions: {
    watch: true,
  },
};

const TimelineScreen = () => {
  const feed = useCreateAndQueryFeed(createFeedConfig);

  if (!feed) {
    return null;
  }

  return (
    <StreamFeed feed={feed}>
      <View style={styles.container}>
        <ConnectionLostHeader />
        <Feed />
      </View>
    </StreamFeed>
  );
};

export default TimelineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
});
