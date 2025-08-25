import type { CommentInputState } from '@/store/comment-input-state-store';
import { store } from '@/store/comment-input-state-store';
import { useStateStore } from '@stream-io/feeds-react-native-sdk';

const selector = ({ editingEntity, parent }: CommentInputState) => ({
  editingEntity,
  parent,
});

export const useCommentInputState = () => {
  return useStateStore(store, selector);
};
