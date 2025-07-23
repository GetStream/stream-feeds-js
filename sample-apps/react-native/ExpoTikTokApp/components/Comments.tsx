import {
  ActivityResponse, CommentResponse,
  useComments,
} from '@stream-io/feeds-react-native-sdk';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import { Reaction } from '@/components/Reaction';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useStableCallback } from '@/hooks/useStableCallback';

const Comment = ({ comment: item }: { comment: CommentResponse }) => {
  const formattedDate = useFormatDate({ date: item.created_at });
  return (
    <View style={styles.commentBlock}>
      <View style={styles.commentRow}>
        <Image source={{ uri: item?.user.image }} style={styles.avatar} />
        <View style={styles.commentContent}>
          <Text style={styles.commentUser}>{item.user.id}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.commentDate}>{formattedDate}</Text>
            <Text style={styles.replyText}> Reply</Text>
          </View>
        </View>

        <View style={styles.reactionContainer}>
          <Reaction type="like" color="black" entity={item} />
          <Text style={styles.reactionCount}>{item.reaction_groups?.like?.count ?? 0}</Text>
          <Reaction type="downvote" color="black" entity={item} />
        </View>
      </View>

      {/* Replies */}
      {/* {item.replies && item.replies.length > 0 && ( */}
      {/*   <TouchableOpacity style={styles.viewReplies}> */}
      {/*     <Text style={styles.viewRepliesText}> */}
      {/*       View {item.replies.length} replies ↓ */}
      {/*     </Text> */}
      {/*   </TouchableOpacity> */}
      {/* )} */}
    </View>
  )
}

const renderItem = ({ item }: { item: CommentResponse }) => {
  return <Comment comment={item} />
}

const keyExtractor = (item: CommentResponse) => item.id

export const Comments = ({ activity }: { activity: ActivityResponse }) => {
  const { comments = [], is_loading_next_page, has_next_page, loadNextPage } = useComments({ parent: activity }) ?? {};

  const loadNext = useStableCallback(() => {
    if (!loadNextPage || !has_next_page || is_loading_next_page) {
      return;
    }
    loadNextPage({ sort: 'last', limit: 5 });
  })

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
    paddingBottom: 100,
  },
  commentBlock: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
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
  reactionContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    marginLeft: 8,
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
});
