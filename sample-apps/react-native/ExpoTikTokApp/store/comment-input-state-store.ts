import { CommentParent, StateStore } from '@stream-io/feeds-react-native-sdk';

export type CommentInputState = {
  editingEntity?: CommentParent;
  parent?: CommentParent;
};

export const store = new StateStore<CommentInputState>({});

export const setEditingEntity = (entity: CommentInputState['editingEntity']) =>
  store.partialNext({ editingEntity: entity });
export const setParent = (entity: CommentInputState['parent']) =>
  store.partialNext({ parent: entity });
