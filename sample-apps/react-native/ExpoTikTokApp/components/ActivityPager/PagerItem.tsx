import type { ActivityResponse } from '@stream-io/feeds-react-native-sdk';
import { useFeedContext } from '@stream-io/feeds-react-native-sdk';
import React, { useMemo } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useActivityPagerContext } from '@/contexts/ActivityPagerContext';
import { PagerVideo } from '@/components/ActivityPager/PagerVideo';
import { Ionicons } from '@expo/vector-icons';
import { Reaction } from '@/components/Reaction';
import { Bookmark } from '@/components/Bookmark';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const UnmemoizedPagerItem = ({
  activity,
  isActive,
}: {
  activity: ActivityResponse;
  isActive: boolean;
}) => {
  const feed = useFeedContext();
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const overlayStyle = useMemo(
    () => ({ bottom: (Platform.OS === 'android' ? insets.bottom : 0) + 60 }),
    [insets.bottom],
  );

  const videoAttachment = useMemo(
    () => activity.attachments.find((a) => a.type === 'video'),
    [activity.attachments],
  );

  if (videoAttachment?.asset_url) {
    return (
      <View style={styles.page}>
        <PagerVideo source={videoAttachment.asset_url} isActive={isActive} />

        <View style={[styles.overlay, overlayStyle]}>
          <Text style={styles.title}>@{activity.user.id}</Text>
          <Text style={styles.description}>{activity.text}</Text>
        </View>

        <View style={[styles.sidebar, overlayStyle]}>
          <View style={styles.iconContainer}>
            <Reaction type="like" entity={activity} size={32} />
            <Text style={styles.iconLabel}>
              {activity.reaction_groups.like?.count ?? 0}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/comments-modal',
                params: {
                  feedUserId: activity.user.id,
                  feedGroupId: feed?.group,
                  activityId: activity.id,
                },
              })
            }
            style={styles.iconContainer}
          >
            <Ionicons name="chatbubble-outline" size={30} color="white" />
            <Text style={styles.iconLabel}>{activity.comment_count ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconContainer}>
            <Bookmark activity={activity} size={28} />
            <Text style={styles.iconLabel}>{activity.bookmark_count ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Sharing was captured successfully, but is not implemented yet !',
              )
            }
            style={styles.iconContainer}
          >
            <Ionicons name="arrow-redo-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.page}>
      <View style={styles.placeholder}>
        <Text style={{ color: 'white' }}>{activity.id}</Text>
        <Text
          style={{ color: 'white' }}
        >{`Is this activity active: ${isActive}`}</Text>
      </View>
    </View>
  );
};

const InnerPagerItem = React.memo(UnmemoizedPagerItem);

export const PagerItem = ({ activity }: { activity: ActivityResponse }) => {
  const { activeId } = useActivityPagerContext();
  const isActive = activeId === activity.id;

  return <InnerPagerItem activity={activity} isActive={isActive} />;
};

const styles = StyleSheet.create({
  page: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  controlsContainer: {
    padding: 10,
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 100, // leave space if you add buttons later
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    color: 'white',
    fontSize: 14,
  },
  sidebar: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
});
