import React, { useCallback, useState } from 'react';
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

export const ActivityComposer = () => {
  const client = useFeedsClient();
  const feed = useFeedContext();
  const [text, setText] = useState('');
  const [media, setMedia] = useState<StreamFile[]>([]);
  const [isSending, setIsSending] = useState(false);

  const pickMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia((prev) => [
        ...prev,
        ...result.assets.map((mediaFile) => {
          const { uri } = mediaFile;
          return {
            uri: mediaFile.uri,
            name: mediaFile.fileName ?? (uri as string).split('/').reverse()[0],
            type: mediaFile.mimeType ?? 'image/jpeg',
          };
        }),
      ]);
    }
  }, []);

  const sendActivity = useCallback(async () => {
    if (!feed) {
      return null;
    }
    setIsSending(true);
    try {
      const files = media;
      const requests = [];
      for (const file of [...(files ?? [])]) {
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
      }

      const fileResponses = await Promise.all(requests);

      await feed.addActivity({
        type: 'post',
        text,
        attachments: fileResponses.map((response, index) => {
          const isImage = isImageFile(files![index]);
          return {
            type: isImage ? 'image' : 'file',
            [isImage ? 'image_url' : 'asset_url']: response?.file,
            custom: {},
          };
        }),
      });
      setMedia([]);
      setText('');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        console.error(error);
      }
    } finally {
      setIsSending(false);
    }
  }, [client, feed, media, text]);

  const submitPressHandler = useCallback(async () => {
    await sendActivity();
    router.back();
  }, [sendActivity]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="What's happening?"
        style={styles.input}
        multiline
        value={text}
        onChangeText={setText}
      />

      <View style={styles.mediaPreviewContainer}>
        {media.map((asset, index) => (
          <View key={index} style={styles.previewItem}>
            {isImageFile(asset) ? (
              <Image
                source={{
                  // TODO: think of a better way to fix this
                  uri: (asset as { uri: string }).uri,
                }}
                style={styles.media}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={isVideoFile(asset) ? videoPlaceholder : filePlaceholder}
                style={styles.media}
                resizeMode="cover"
              />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={pickMedia} style={styles.button}>
        <Text style={styles.buttonText}>Upload Image/Video</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={isSending}
        onPress={submitPressHandler}
        style={styles.button}
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
});
