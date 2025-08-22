import { StyleSheet } from 'react-native';

import { View } from '@/components/common/Themed';
import { ConnectionLostHeader } from '@/components/common/ConnectionLostHeader';
import { Search } from '@/components/search';

const ExploreScreen = () => {
  return (
    <View style={styles.container}>
      <ConnectionLostHeader />
      <Search />
    </View>
  );
}

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    height: '100%',
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
