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
  height: number;
};

const DEFAULT_STATE: BottomSheetState = {
  open: false,
  data: undefined,
  height: Number.MAX_SAFE_INTEGER,
}

export const store = new StateStore<BottomSheetState>(DEFAULT_STATE);

export const openSheetWith = (data: BottomSheetData) =>
  store.partialNext({ open: true, data });

export const closeSheet = () =>
  store.partialNext(DEFAULT_STATE);

export const setHeight = (height: number) => store.partialNext({ height });
