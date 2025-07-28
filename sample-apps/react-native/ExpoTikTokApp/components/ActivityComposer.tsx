import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
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
import { router } from 'expo-router';
// @ts-expect-error something broken with local assets, will fix later
import videoPlaceholder from '@/assets/images/video-placeholder.png';
// @ts-expect-error something broken with local assets, will fix later
import filePlaceholder from '@/assets/images/file-placeholder.png';
import { Place, PlaceSearchDropdown } from '@/components/PlaceSearchDropdown';

export const ActivityComposer = () => {
  const client = useFeedsClient();
  const feed = useFeedContext();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<StreamFile[]>([]);
  const [media, setMedia] = useState<Attachment[]>([]);
  const [location, setLocation] = useState<Place | null>(null);
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
  }, [sendActivity]);

  const submitButtonDisabled = useMemo(
    () => isSending || media.length < 1,
    [isSending, media.length],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>
        Upload a video and write something about it !
      </Text>
      <TextInput
        placeholder="What's happening?"
        style={styles.input}
        multiline
        value={text}
        onChangeText={setText}
      />

      <PlaceSearchDropdown
        apiKey={'6758e7d54b454482b4eaf7de45e60fb2'}
        onPlaceSelected={setLocation}
      />

      <View style={styles.mediaPreviewContainer}>
        {files.map((asset, index) => (
          <View key={index} style={styles.previewItem}>
            {isImageFile(asset) ? (
              <Image
                source={{
                  uri:
                    media?.[index]?.image_url ?? (asset as { uri: string }).uri,
                }}
                style={styles.media}
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
                style={styles.media}
                resizeMode="cover"
              />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={pickMedia} style={styles.button}>
        <Text style={styles.buttonText}>Upload Video</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={submitButtonDisabled}
        onPress={submitPressHandler}
        style={submitButtonDisabled ? styles.disabledButton : styles.button}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 16,
  },
  input: {
    fontSize: 16,
    minHeight: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: 'grey',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewItem: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  searchContainer: { position: 'absolute', top: 20, width: '100%', zIndex: 10 },
  listView: { backgroundColor: 'white', height: 400 },
});
