import { Feed } from '@/components/Feed';
import { StyleSheet, View } from 'react-native';
import { ConnectionLostHeader } from '@/components/ConnectionLostHeader';
import { StreamFeed } from '@stream-io/feeds-react-native-sdk';
import { useOwnFeedsContext } from '@/contexts/OwnFeedsContext';

const TimelineScreen = () => {
  const { ownTimelineFeed } = useOwnFeedsContext();

  if (!ownTimelineFeed) {
    return null;
  }

  return (
    <StreamFeed feed={ownTimelineFeed}>
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
