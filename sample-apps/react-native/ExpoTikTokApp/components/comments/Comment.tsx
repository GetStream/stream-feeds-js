import React from 'react';
import {
  CommentResponse,
  useClientConnectedUser,
} from '@stream-io/feeds-react-native-sdk';
import { useComments } from '@stream-io/feeds-react-native-sdk';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useStableCallback } from '@/hooks/useStableCallback';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Reaction } from '@/components/common/Reaction';
import { COMMENTS_LOADING_CONFIG } from '@/constants/stream';
import { openSheetWith } from '@/store/bottom-sheet-state-store';
import { useRouter } from 'expo-router';
import { setParent } from '@/store/comment-input-state-store';
import { MentionText } from '@/components/common/MentionText';

export const Comment = ({
  comment,
  depth = 0,
}: {
  comment: CommentResponse;
  depth?: number;
}) => {
  const router = useRouter();
  const connectedUser = useClientConnectedUser();
  const isFirstLevel = depth === 0;
  const formattedDate = useFormatDate({ date: comment.created_at });
  const {
    comments = [],
    is_loading_next_page,
    has_next_page,
    loadNextPage,
  } = useComments({ parent: comment }) ?? {};

  const loadNext = useStableCallback(async () => {
    if (is_loading_next_page || !loadNextPage || !has_next_page) {
      return;
    }
    loadNextPage(COMMENTS_LOADING_CONFIG);
  });

  const openSheet = useStableCallback(() => {
    openSheetWith({ type: 'comment', entity: comment, depth });
    router.push('/overlay/sheet');
  });

  const repliesLeftToLoad = comment.reply_count - comments.length;

  return (
    <TouchableOpacity
      style={[
        styles.commentBlock,
        isFirstLevel ? styles.commentBlockBorder : {},
      ]}
      onLongPress={openSheet}
      disabled={depth > 0 && comment.user.id !== connectedUser?.id}
    >
      <View style={styles.commentRow}>
        <Image
          source={{ uri: comment?.user.image }}
          style={isFirstLevel ? styles.avatar : styles.replyAvatar}
        />
        <View style={styles.commentContent}>
          <Text style={styles.commentUser}>{comment.user.id}</Text>
          <MentionText
            text={comment.text ?? ''}
            mentionedUsers={comment.mentioned_users}
            style={styles.commentText}
          />
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  deleteButton: {},
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
  replySection: {
    paddingLeft: 32,
  },
});
