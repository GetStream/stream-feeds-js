import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Image,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import {
  Attachment,
  isImageFile,
  isVideoFile,
  StreamFile,
  useFeedContext,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useRouter } from 'expo-router';
// @ts-expect-error something broken with local assets, will fix later
import videoPlaceholder from '@/assets/images/video-placeholder.png';
// @ts-expect-error something broken with local assets, will fix later
import filePlaceholder from '@/assets/images/file-placeholder.png';
import { placesApiKey } from '@/constants/stream';
import { Ionicons } from '@expo/vector-icons';
import { usePostCreationContext } from '@/contexts/PostCreationContext';

export const ActivityComposer = () => {
  const client = useFeedsClient();
  const feed = useFeedContext();
  const router = useRouter();

  const [text, setText] = useState('');
  const [files, setFiles] = useState<StreamFile[]>([]);
  const [media, setMedia] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);

  const { location, setLocation } = usePostCreationContext();

  const pickMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const rawFiles = result.assets;
      const requests = [];
      const localFiles: StreamFile[] = [];
      for (const rawFile of [...(rawFiles ?? [])]) {
        const { uri } = rawFile;
        const file = {
          uri: rawFile.uri,
          name: rawFile.fileName ?? (uri as string).split('/').reverse()[0],
          type: rawFile.mimeType ?? 'image/jpeg',
        };
        if (isImageFile(file)) {
          requests.push(
            client?.uploadImage({
              file,
            }),
          );
        } else {
          requests.push(
            client?.uploadFile({
              file,
            }),
          );
        }
        localFiles.push(file);
      }

      setFiles((prevFiles) => [...prevFiles, ...localFiles]);

      const fileResponses = await Promise.all(requests);

      setMedia((prev) => [
        ...prev,
        ...fileResponses.map((response, index) => {
          const file = localFiles[index];
          const isImage = isImageFile(file);
          const isVideo = isVideoFile(file);
          return {
            type: isImage ? 'image' : isVideo ? 'video' : 'file',
            [isImage ? 'image_url' : 'asset_url']: response?.file,
            custom: {},
            ...(isVideo && response?.thumb_url
              ? { thumb_url: response.thumb_url }
              : {}),
          };
        }),
      ]);
    }
  }, [client]);

  const sendActivity = useCallback(async () => {
    if (!feed) {
      return null;
    }
    setIsSending(true);
    try {
      await feed.addActivity({
        type: 'post',
        text,
        attachments: media,
        ...(location
          ? {
              location: {
                lat: location.latitude,
                lng: location.longitude,
              },
              custom: {
                locationName: location.name,
              },
            }
          : {}),
      });
      setMedia([]);
      setText('');
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    } finally {
      setIsSending(false);
    }
  }, [feed, location, media, text]);

  const submitPressHandler = useCallback(async () => {
    await sendActivity();
    router.back();
  }, [router, sendActivity]);

  const submitButtonDisabled = useMemo(
    () => isSending || media.length < 1,
    [isSending, media.length],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.uploadItemsContainer}>
        <Pressable onPress={pickMedia} style={styles.uploadContainer}>
          <Ionicons name="add-outline" size={32} color="#888" />
          <Text style={styles.uploadText}>Add</Text>
        </Pressable>
        {files.length > 0 ? (
          <MediaPickerRow media={files} onRemove={() => null} />
        ) : (
          <Text style={styles.uploadHint}>
            📘 Upload at least one photo (max 10) or a video.
          </Text>
        )}
      </View>

      <View style={styles.rewardBanner}>
        <Text style={styles.rewardText}>
          You have used {text.length} out of 250 characters.
        </Text>
      </View>

      <TextInput
        multiline
        style={styles.descriptionInput}
        placeholder="💡 Tell us more about your post."
        placeholderTextColor="#888"
        value={text}
        onChangeText={setText}
      />

      {placesApiKey ? (
        <>
          <Pressable
            style={styles.locationRow}
            onPress={() => router.push('/pick-location-modal')}
            disabled={!!location}
          >
            <Ionicons
              name="location-outline"
              size={22}
              color="#555"
              style={styles.locationIcon}
            />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationTitle}>
                {location ? location.name : 'Tag location'}
              </Text>
              <Text style={styles.locationSubtitle}>
                {location ? 'Address 1' : 'Cities, Countries and Towns'}
              </Text>
            </View>
            {location ? (
              <Pressable
                style={styles.cancelLocationButton}
                onPress={() => {
                  setLocation?.(null);
                }}
              >
                <Ionicons name="close" size={20} color="#888" />
              </Pressable>
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#999" />
            )}
          </Pressable>
        </>
      ) : null}
      <Pressable
        disabled={submitButtonDisabled}
        onPress={submitPressHandler}
        style={[
          styles.postButton,
          submitButtonDisabled ? styles.disabledPostButton : {},
        ]}
      >
        <Text style={styles.postButtonText}>Post</Text>
      </Pressable>
    </ScrollView>
  );
};

type Props = {
  media: any[];
  onRemove: (id: string) => void;
};

export const MediaPickerRow = ({ media, onRemove }: Props) => {
  return (
    <FlatList
      data={media}
      horizontal
      keyExtractor={(item, index) => `${item.name}_${index}`}
      contentContainerStyle={styles.listContainer}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item: asset, index }) => (
        <View style={styles.thumbnailContainer}>
          {isImageFile(asset) ? (
            <Image
              source={{
                uri:
                  media?.[index]?.image_url ?? (asset as { uri: string }).uri,
              }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={
                media?.[index] && media[index].thumb_url
                  ? { uri: media[index].thumb_url }
                  : isVideoFile(asset)
                    ? videoPlaceholder
                    : filePlaceholder
              }
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
          <Pressable
            onPress={() => onRemove(asset.id)}
            style={styles.removeButton}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </Pressable>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  uploadItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadContainer: {
    height: 90,
    width: 90,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 16,
  },
  uploadText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  uploadHint: {
    color: '#888',
    fontSize: 15,
    marginRight: 16,
    flexShrink: 1,
  },
  rewardBanner: {
    backgroundColor: '#004d40',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rewardText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
  descriptionInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postButton: {
    marginTop: 24,
    backgroundColor: '#00d26a',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledPostButton: {
    backgroundColor: 'grey',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
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
  cancelLocationButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10,
  },
});
