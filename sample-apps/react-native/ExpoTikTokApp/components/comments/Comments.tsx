import type {
  ActivityResponse,
  CommentResponse,
} from '@stream-io/feeds-react-native-sdk';
import { useComments } from '@stream-io/feeds-react-native-sdk';
import { FlatList, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';
import { Comment } from '@/components/comments/Comment';
import { COMMENTS_LOADING_CONFIG } from '@/constants/stream';
import { ActivityProvider } from '../../contexts/ActivityContext';

const maintainVisibleContentPosition = {
  minIndexForVisible: 0,
  autoscrollToTopThreshold: 10,
};

const renderItem = ({ item }: { item: CommentResponse }) => {
  return <Comment comment={item} />;
};

const keyExtractor = (item: CommentResponse) => item.id;

export const Comments = ({ activity }: { activity: ActivityResponse }) => {
  const {
    comments = [],
    is_loading_next_page,
    has_next_page,
    loadNextPage,
  } = useComments({ parent: activity }) ?? {};

  const loadNext = useStableCallback(() => {
    if (!loadNextPage || !has_next_page || is_loading_next_page) {
      return;
    }
    loadNextPage(COMMENTS_LOADING_CONFIG);
  });

  useEffect(() => {
    if (comments?.length || !loadNextPage || is_loading_next_page) return;

    void loadNextPage({ ...COMMENTS_LOADING_CONFIG, limit: 10 });
  }, [activity, comments, is_loading_next_page, loadNextPage]);

  return (
    <ActivityProvider activity={activity}>
      <FlatList
        // @ts-expect-error FlatList internal, perf reasons
        strictMode={true}
        data={comments}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.commentList}
        renderItem={renderItem}
        onEndReached={loadNext}
        onEndReachedThreshold={0.2}
        removeClippedSubviews={false}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
      />
    </ActivityProvider>
  );
};

const styles = StyleSheet.create({
  commentList: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
});
