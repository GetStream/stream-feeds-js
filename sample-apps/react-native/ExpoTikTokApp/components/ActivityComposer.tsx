import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import {
  isImageFile,
  isVideoFile,
  StreamFile,
  useFeedContext,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useRouter } from 'expo-router';
import { placesApiKey } from '@/constants/stream';
import { Ionicons } from '@expo/vector-icons';
import { usePostCreationContext } from '@/contexts/PostCreationContext';
import { useStableCallback } from '@/hooks/useStableCallback';
import { MediaPickerRow } from '@/components/MediaPickerList';
import { ACTIVITY_TEXT_MAX_CHARACTERS } from '@/constants/stream';

export const ActivityComposer = () => {
  const client = useFeedsClient();
  const feed = useFeedContext();
  const router = useRouter();

  const [text, setText] = useState('');
  const [files, setFiles] = useState<StreamFile[]>([]);
  const [isSending, setIsSending] = useState(false);

  const {
    location,
    media = [],
    setLocation,
    setMedia,
  } = usePostCreationContext();

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
        ...(prev ?? []),
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
  }, [client, setMedia]);

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
              // So that activities can also be searched by location
              search_data: {
                locationName: location.name,
              }
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
  }, [feed, location, media, setMedia, text]);

  const submitPressHandler = useCallback(async () => {
    await sendActivity();
    router.back();
  }, [router, sendActivity]);

  const removeFile = useStableCallback((index: number) => {
    if (setMedia) {
      setMedia((prevMedia) => {
        const newMedia = [...(prevMedia ?? [])];
        newMedia.splice(index, 1);
        return newMedia;
      });
      setFiles((prevFiles) => {
        const newFiles = [...(prevFiles ?? [])];
        newFiles.splice(index, 1);
        return newFiles;
      });
    }
  });

  const isTextAboveMax = text.length > ACTIVITY_TEXT_MAX_CHARACTERS;

  const submitButtonDisabled = useMemo(
    () => isSending || media.length < 1 || isTextAboveMax,
    [isSending, media.length, isTextAboveMax],
  );

  const uploadButtonDisabled = useMemo(
    () => media.length >= 1 || files.length >= 1,
    [files.length, media.length],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.uploadItemsContainer}>
        <Pressable
          disabled={uploadButtonDisabled}
          onPress={pickMedia}
          style={[
            styles.uploadContainer,
            uploadButtonDisabled ? { opacity: 0.5 } : {},
          ]}
        >
          <Ionicons name="add-outline" size={32} color="#888" />
          <Text style={styles.uploadText}>Add</Text>
        </Pressable>
        {files.length > 0 ? (
          <MediaPickerRow files={files} onRemove={removeFile} />
        ) : (
          <Text style={styles.uploadHint}>
            📘 Upload at least one photo (max 10) or a video.
          </Text>
        )}
      </View>

      <View
        style={[
          styles.rewardBanner,
          isTextAboveMax ? { backgroundColor: 'red' } : {},
        ]}
      >
        <Text style={styles.rewardText}>
          You have used {text.length} out of {ACTIVITY_TEXT_MAX_CHARACTERS}{' '}
          characters.
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
                {location ? location.address : 'Cities, Countries and Towns'}
              </Text>
            </View>
            {location ? (
              <Pressable
                style={styles.cancelLocationButton}
                onPress={() => {
                  setLocation?.(undefined);
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
  cancelLocationButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10,
  },
});
