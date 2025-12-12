import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import {
  Attachment,
  CreateFeedsBatchResponse,
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
import { MediaPickerRow } from '@/components/activity-composer/MediaPickerList';
import { ACTIVITY_TEXT_MAX_CHARACTERS } from '@/constants/stream';
import { useActivityActionState } from '@/hooks/useActivityActionState';
import { resetState } from '@/store/activity-action-state-store';
import AutocompleteInput from '@/components/common/autocomplete-input/AutocompleteInput';
import { findMatchedTokens } from '@/utils/findMatchedTokens';

export const ActivityComposer = () => {
  const client = useFeedsClient();
  const feed = useFeedContext();
  const router = useRouter();

  const { editingActivity } = useActivityActionState();
  const {
    location,
    media = [],
    setLocation,
    setMedia,
  } = usePostCreationContext();

  const [text, setText] = useState(editingActivity?.text ?? '');
  const [files, setFiles] = useState<StreamFile[]>(() =>
    media.map((attachment: Attachment) => {
      const type = attachment.type ?? 'file';
      const uri = (
        type === 'image' ? attachment.image_url : attachment.asset_url
      ) as string;
      return {
        name: attachment.title ?? '',
        uri,
        type,
      };
    }),
  );
  const [isSending, setIsSending] = useState(false);

  const pickMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      const rawFiles = result.assets;
      const requests = [];
      const localFiles: Array<StreamFile & { duration?: number | null }> = [];
      for (const rawFile of [...(rawFiles ?? [])]) {
        const { uri } = rawFile;
        const file = {
          uri: rawFile.uri,
          name: rawFile.fileName ?? (uri as string).split('/').reverse()[0],
          duration: rawFile.duration,
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

      try {
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
              title: file.name,
              custom: {
                ...(isVideo && file.duration
                  ? { duration: file.duration }
                  : {})
              },
              ...(isVideo && response?.thumb_url
                ? { thumb_url: response.thumb_url }
                : {}),
            };
          }),
        ]);
      } catch (error) {
        console.error(error);
      }
    }
  }, [client, setMedia]);

  const sendActivity = useStableCallback(async () => {
    if (!feed) {
      return null;
    }
    setIsSending(true);
    try {
      const mentionedUsers = findMatchedTokens({ text, matcher: '@' });
      const hashtags = findMatchedTokens({ text, matcher: '#' });

      const hasHashtags = hashtags && hashtags.length > 0;

      let createdHashtagFeeds: CreateFeedsBatchResponse['feeds'] = [];

      if (hasHashtags) {
        const response = await client?.createFeedsBatch({
          feeds: hashtags.map((hashtag) => ({
            feed_group_id: 'hashtag',
            feed_id: hashtag,
            name: hashtag,
            visibility: 'public',
          })),
        });
        createdHashtagFeeds = response?.feeds ?? [];
      }

      const activityData = {
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
              },
            }
          : {}),
        ...(mentionedUsers ? { mentioned_user_ids: mentionedUsers } : {}),
      };

      if (editingActivity) {
        await client?.updateActivity({
          ...activityData,
          id: editingActivity.id,
          feeds: [
            feed.feed,
            ...createdHashtagFeeds.map((hashtagFeed) => hashtagFeed.feed),
          ]
        });
      } else if (hasHashtags) {
        await client?.addActivity({
          ...activityData,
          feeds: [
            feed.feed,
            ...createdHashtagFeeds.map((hashtagFeed) => hashtagFeed.feed),
          ],
        });
      } else {
        await feed.addActivity(activityData);
      }

      setMedia([]);
      setText('');
      resetState();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    } finally {
      setIsSending(false);
    }
  });

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
            📘 Add a video and bring your post to life !
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

      <View>
        <AutocompleteInput
          multiline
          style={styles.descriptionInput}
          placeholder="💡 Tell us more about your post."
          placeholderTextColor="#888"
          text={text}
          setText={setText}
          height={180}
        />
      </View>

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
    maxHeight: 200,
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
