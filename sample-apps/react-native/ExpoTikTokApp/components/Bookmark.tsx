import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import React from 'react';
import {
  ActivityResponse,
  useBookmarkActions,
} from '@stream-io/feeds-react-native-sdk';
import { useFeedsClient } from '@stream-io/feeds-react-native-sdk';

type BookmarkIconProps = {
  size: number;
  color: string;
};

export const Bookmark = ({
  activity,
  size = 20,
  color = 'white',
}: { activity: ActivityResponse } & Partial<BookmarkIconProps>) => {
  const hasOwnBookmark = activity.own_bookmarks?.length > 0;

  const { toggleBookmark } = useBookmarkActions({ entity: activity });

  return (
    <TouchableOpacity onPress={toggleBookmark}>
      <Ionicons
        name={hasOwnBookmark ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
};
