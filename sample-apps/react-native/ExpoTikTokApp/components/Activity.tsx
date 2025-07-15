import { ActivityResponse } from '@stream-io/feeds-react-native-sdk';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// @ts-expect-error something broken with local assets, will fix later
import postPlaceholder from '@/assets/images/post-placeholder.png';
import { Ionicons } from '@expo/vector-icons';

export const Activity = ({ activity }: { activity: ActivityResponse }) => {
  const attachment = activity.attachments.find(
    (att) => att.type === 'video' || att.type === 'image',
  );
  const image = attachment?.image_url ?? attachment?.thumb_url;

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image
          source={image ? { uri: image } : postPlaceholder}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {activity.text}
      </Text>
      <Text style={styles.subtitle}>{activity.user.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 144,
    borderRadius: 12,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  title: {
    fontWeight: '600',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
});
