import { Ionicons } from '@expo/vector-icons';
import { Share, TouchableOpacity } from 'react-native';
import React from 'react';
import {
  Attachment,
  isImageFile,
  isVideoFile,
} from '@stream-io/feeds-react-native-sdk';
import { useStableCallback } from '@/hooks/useStableCallback';

const pretext = 'Check out this cool';

export const ShareButton = ({ attachment }: { attachment: Attachment }) => {
  const shareText = attachment.image_url
    ? `${pretext} image ! ${attachment.image_url}`
    : `${pretext} video ! ${attachment.asset_url}`;

  const shareContent = useStableCallback(async () => {
    try {
      await Share.share({
        message: shareText,
        title: 'ExpoTikTokApp',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  });

  return (
    <TouchableOpacity onPress={shareContent}>
      <Ionicons name="arrow-redo-outline" size={28} color="white" />
    </TouchableOpacity>
  );
};
