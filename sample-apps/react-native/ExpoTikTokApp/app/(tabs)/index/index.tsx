import { Feed } from '@/components/Feed';
import { StyleSheet, View } from 'react-native';
import { ConnectionLostHeader } from '@/components/ConnectionLostHeader';

const TabOneScreen = () => {
  return (
    <View style={styles.container}>
      <ConnectionLostHeader />
      <Feed />
    </View>
  );
};

export default TabOneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
});
