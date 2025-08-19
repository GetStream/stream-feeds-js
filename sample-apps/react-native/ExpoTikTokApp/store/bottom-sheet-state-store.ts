import { CommentParent, StateStore } from '@stream-io/feeds-react-native-sdk';

export type BottomSheetData =
  | {
  entity: CommentParent;
  type: 'activity';
  depth?: never;
}
  | {
  entity: CommentParent;
  type: 'comment';
  depth: number;
};

export type BottomSheetState = {
  open: boolean;
  data?: BottomSheetData;
};

export const store = new StateStore<BottomSheetState>({
  open: false,
  data: undefined,
});

export const openSheetWith = (data: BottomSheetData) =>
  store.partialNext({ open: true, data });

export const closeSheet = () =>
  store.partialNext({ open: false, data: undefined });
