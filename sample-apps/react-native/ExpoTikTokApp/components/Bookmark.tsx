import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import React from 'react';
import {
  ActivityResponse,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import { useStableCallback } from '@/hooks/useStableCallback';

type BookmarkIconProps = {
  size: number;
  color: string;
};

export const Bookmark = ({
  activity,
  size = 20,
  color = 'white',
}: { activity: ActivityResponse } & Partial<BookmarkIconProps>) => {
  const client = useFeedsClient();

  const hasOwnBookmark = activity.own_bookmarks?.length > 0;

  const addBookmark = useStableCallback(async () => {
    await client?.addBookmark({ activity_id: activity.id });
  });

  const removeBookmark = useStableCallback(async () => {
    await client?.deleteBookmark({ activity_id: activity.id });
  });

  const toggleBookmark = useStableCallback(async () => {
    if (hasOwnBookmark) {
      await removeBookmark();
    } else {
      await addBookmark();
    }
  });

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
