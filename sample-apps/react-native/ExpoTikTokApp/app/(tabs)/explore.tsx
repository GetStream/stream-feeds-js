import { StyleSheet } from 'react-native';

import { View } from '@/components/Themed';
import { ConnectionLostHeader } from '@/components/ConnectionLostHeader';
// import { FeedSourceResultList } from '@/components/Search/FeedSourceResultList';
import { Search } from '@/components/Search';

const ExploreScreen = () => {
  return (
    <View>
      <ConnectionLostHeader />
      {/* <FeedSourceResultList types={['user']} /> */}
      <Search />
    </View>
  );
}

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  info: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  }
});
