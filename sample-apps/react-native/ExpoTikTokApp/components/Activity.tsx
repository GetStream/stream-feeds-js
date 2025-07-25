import {
  ActivityResponse,
  useFeedContext,
} from '@stream-io/feeds-react-native-sdk';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// @ts-expect-error something broken with local assets, will fix later
import postPlaceholder from '@/assets/images/post-placeholder.png';
import { Reaction } from '@/components/Reaction';
import { useRouter } from 'expo-router';
import FastImage from 'react-native-fast-image';
import { useMemo } from 'react';

export const Activity = ({
  activity,
  index,
}: {
  activity: ActivityResponse;
  index: number;
}) => {
  const feed = useFeedContext();
  const router = useRouter();
  const attachment = activity.attachments.find(
    (att) => att.type === 'video' || att.type === 'image',
  );
  const image = attachment?.image_url ?? attachment?.thumb_url;

  const imageSource = useMemo(() => {
    return image ? { uri: image } : postPlaceholder;
  }, [image]);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/activity-pager-screen',
          params: {
            initialIndex: index,
            groupId: feed?.group,
            id: feed?.id,
          },
        })
      }
      style={styles.card}
    >
      <View style={styles.imageWrapper}>
        <FastImage
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.heartIcon}>
          <Reaction type="like" entity={activity} />
        </View>
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
