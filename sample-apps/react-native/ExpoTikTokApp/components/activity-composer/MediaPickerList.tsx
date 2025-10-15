import type { StreamFile } from '@stream-io/feeds-react-native-sdk';
import { isImageFile, isVideoFile } from '@stream-io/feeds-react-native-sdk';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { usePostCreationContext } from '@/contexts/PostCreationContext';
// @ts-expect-error something broken with local assets, will fix later
import videoPlaceholder from '@/assets/images/video-placeholder.png';
// @ts-expect-error something broken with local assets, will fix later
import filePlaceholder from '@/assets/images/file-placeholder.png';
import { Ionicons } from '@expo/vector-icons';
import { ImageWithRetry } from '@/components/common/ImageWithRetry';

const keyExtractor = (item: StreamFile, index: number) =>
  `${item.name}_${index}`;

export const MediaPickerRow = ({
  files,
  onRemove,
}: {
  files: StreamFile[];
  onRemove: (index: number) => void;
}) => {
  const renderMediaItem = useCallback(
    ({ item, index }: { item: StreamFile; index: number }) => {
      return <MediaThumbnail file={item} index={index} onRemove={onRemove} />;
    },
    [onRemove],
  );

  return (
    <FlatList
      data={files}
      horizontal
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContainer}
      showsHorizontalScrollIndicator={false}
      renderItem={renderMediaItem}
    />
  );
};

const MediaThumbnail = ({
  file,
  index,
  onRemove,
}: {
  file: StreamFile;
  index: number;
  onRemove: (index: number) => void;
}) => {
  const { media } = usePostCreationContext();
  const asset = useMemo(() => media?.[index], [index, media]);

  return (
    <View style={styles.thumbnailContainer}>
      {isImageFile(file) ? (
        <ImageWithRetry
          source={{
            uri: asset?.image_url ?? (file as { uri: string }).uri,
          }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : asset ? (
        <ImageWithRetry
          source={
            asset.thumb_url
              ? { uri: asset.thumb_url }
              : isVideoFile(file)
                ? videoPlaceholder
                : filePlaceholder
          }
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="small" color="#aaa" />
          </View>
        </View>
      )}
      <Pressable onPress={() => onRemove(index)} style={styles.removeButton}>
        <Ionicons name="close" size={16} color="#fff" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  // media row

  listContainer: {
    paddingVertical: 12,
    gap: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    padding: 2,
  },
  placeholderContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  spinnerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
});
