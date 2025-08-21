import { CommentParent, StateStore } from '@stream-io/feeds-react-native-sdk';

export type CommentInputState = {
  editingEntity?: CommentParent;
  parent?: CommentParent;
};

const DEFAULT_STATE: CommentInputState = {
  editingEntity: undefined,
  parent: undefined,
};

export const store = new StateStore<CommentInputState>(DEFAULT_STATE);

export const setEditingEntity = (entity: CommentInputState['editingEntity']) =>
  store.partialNext({ editingEntity: entity });

export const setParent = (entity: CommentInputState['parent']) =>
  store.partialNext({ parent: entity });

export const resetState = () => store.partialNext(DEFAULT_STATE);
