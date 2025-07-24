import {
  ActivityResponse,
  CommentResponse,
  useComments,
  useFeedsClient,
} from '@stream-io/feeds-react-native-sdk';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import { Reaction } from '@/components/Reaction';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useCommentsInputActionsContext } from '@/contexts/CommentsInputContext';
import { Ionicons } from '@expo/vector-icons';

const maintainVisibleContentPosition = {
  minIndexForVisible: 1,
  autoscrollToTopThreshold: 10,
};

const Comment = ({
  comment,
  depth = 0,
}: {
  comment: CommentResponse;
  depth?: number;
}) => {
  const client = useFeedsClient();
  const isFirstLevel = depth === 0;
  const formattedDate = useFormatDate({ date: comment.created_at });
  const {
    comments = [],
    is_loading_next_page,
    has_next_page,
    loadNextPage,
  } = useComments({ parent: comment }) ?? {};

  const { setParent } = useCommentsInputActionsContext();

  const loadNext = useStableCallback(async () => {
    if (is_loading_next_page || !loadNextPage || !has_next_page) {
      return;
    }
    loadNextPage({ sort: 'last', limit: 5 });
  });

  const handleCommentDeletion = useStableCallback(() => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment ? The action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => client?.deleteComment({ comment_id: comment.id }),
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  });

  const repliesLeftToLoad = comment.reply_count - comments.length;

  return (
    <View
      style={[
        styles.commentBlock,
        isFirstLevel ? styles.commentBlockBorder : {},
      ]}
    >
      <View style={styles.commentRow}>
        <Image
          source={{ uri: comment?.user.image }}
          style={isFirstLevel ? styles.avatar : styles.replyAvatar}
        />
        <View style={styles.commentContent}>
          <Text style={styles.commentUser}>{comment.user.id}</Text>
          <Text style={styles.commentText}>{comment.text}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.commentDate}>{formattedDate}</Text>
            {isFirstLevel ? (
              <TouchableOpacity onPress={() => setParent(comment)}>
                <Text style={styles.replyText}> Reply</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.commentActionsContainer}>
          <View style={styles.deleteButton}>
            <TouchableOpacity
              onPress={handleCommentDeletion}
            >
              <Ionicons name="trash" color="red" size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.reactionContainer}>
            <Reaction type="like" color="black" entity={comment} />
            <Text style={styles.reactionCount}>
              {comment.reaction_groups?.like?.count ?? 0}
            </Text>
            <Reaction type="downvote" color="black" entity={comment} />
          </View>
        </View>
      </View>

      {comments?.length > 0 ? (
        <View style={styles.replySection}>
          {comments.map((subComment) => (
            <Comment
              key={subComment.id}
              comment={subComment}
              depth={depth + 1}
            />
          ))}
        </View>
      ) : null}

      {isFirstLevel && repliesLeftToLoad > 0 && has_next_page ? (
        <TouchableOpacity onPress={loadNext} style={styles.viewReplies}>
          <Text style={styles.viewRepliesText}>
            View {repliesLeftToLoad}{' '}
            {repliesLeftToLoad === 1 ? 'reply' : 'replies'} ↓
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
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
    loadNextPage({ sort: 'last', limit: 5 });
  });

  useEffect(() => {
    if (comments?.length || !loadNextPage || is_loading_next_page) return;

    void loadNextPage({
      sort: 'last',
      limit: 10,
    });
  }, [activity, comments, is_loading_next_page, loadNextPage]);

  return (
    <FlatList
      // @ts-expect-error FlatList internal, perf reasons
      strictMode={true}
      data={comments}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.commentList}
      renderItem={renderItem}
      onEndReached={loadNext}
      onEndReachedThreshold={0.2}
      maintainVisibleContentPosition={maintainVisibleContentPosition}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 32,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 32,
    zIndex: 10,
  },
  closeText: {
    fontSize: 28,
    color: '#fff',
  },
  commentList: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  commentBlockBorder: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  commentBlock: {
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc',
    marginRight: 8,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  commentText: {
    color: '#000',
    fontSize: 14,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  replyText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 12,
  },
  commentActionsContainer: {
    marginLeft: 8,
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  deleteButton: {
    flex: 1,
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  reactionIcon: {
    fontSize: 16,
    color: '#999',
    marginBottom: 2,
  },
  reactionCount: {
    width: 30,
    fontSize: 12,
    alignSelf: 'center',
    color: '#666',
    marginBottom: 2,
  },
  viewReplies: {
    marginLeft: 44,
    marginTop: 6,
  },
  viewRepliesText: {
    fontSize: 13,
    color: '#666',
  },
  reply: {
    marginLeft: 20,
    marginBottom: 6,
  },
  replyUser: {
    color: '#aaa',
    fontWeight: 'bold',
    fontSize: 13,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopColor: '#222',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
  },
  sendButton: {
    fontSize: 18,
    color: '#0af',
    marginLeft: 12,
  },
  replySection: {
    paddingLeft: 32,
  },
});
