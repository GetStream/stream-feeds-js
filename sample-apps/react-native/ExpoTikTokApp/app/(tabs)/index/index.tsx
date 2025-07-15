import { StyleSheet } from 'react-native';
import {
  ActivityResponse,useFeedContext, useStateStore,
} from '@stream-io/feeds-react-native-sdk';

import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionLoadHeader } from '@/components/ConnectionLostHeader';

const ActivityListItem = ({ item }: { item: ActivityResponse }) => {
  const attachment = item.attachments.find(att => att.type === 'image' || att.type === 'video');
  const image = attachment?.image_url ?? attachment?.thumb_url;

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.imageWrapper}>
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <TouchableOpacity style={styles.heartIcon}>
          <Ionicons name="heart-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.text}</Text>
      <Text style={styles.subtitle}>
        {item.user.name}
      </Text>
    </TouchableOpacity>
  );
};

const renderItem = ({ item }: { item: ActivityResponse }) => <ActivityListItem item={item} />;

const TabOneScreen = () => {
  const feed = useFeedContext();
  const {
    hasNextPage,
    isLoading,
    activities,
    ownCapabilities = [],
  } = useStateStore(feed?.state, (state) => ({
    isLoading: state.is_loading_activities,
    hasNextPage: typeof state.next !== 'undefined',
    activities: state.activities ?? [],
    ownCapabilities: state.own_capabilities,
  })) ?? {};
  return (
    <View style={styles.container}>
      <ConnectionLoadHeader />
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi Nadia</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={20} />
          <Ionicons name="heart-outline" size={20} />
        </View>
      </View>

      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default TabOneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
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
  badgeContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
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
