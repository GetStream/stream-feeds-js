import { useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';

const LocationMapScreen = () => {
  const { latitude, longitude, name } = useLocalSearchParams();
  return (
    <View>
      <Text>{name}</Text>
      <Text>{latitude}</Text>
      <Text>{longitude}</Text>
    </View>
  );
};

export default LocationMapScreen;
