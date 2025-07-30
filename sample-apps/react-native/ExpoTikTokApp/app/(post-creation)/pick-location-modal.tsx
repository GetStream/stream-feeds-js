import { PlaceSearchDropdown } from '@/components/PlaceSearchDropdown';
import { StyleSheet, View } from 'react-native';

const CreatePostScreen = () => {
  return (
    <View style={styles.container}>
      <PlaceSearchDropdown />
    </View>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'fff' },
});
