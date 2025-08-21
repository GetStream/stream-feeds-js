import type {
  BottomSheetState,
  BottomSheetData,
} from '@/store/bottom-sheet-state-store';
import {
  store,
  openSheetWith,
  closeSheet,
} from '@/store/bottom-sheet-state-store';
import { useStateStore } from '@stream-io/feeds-react-native-sdk';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useRouter } from 'expo-router';

const selector = ({ open, data, height }: BottomSheetState) => ({
  open,
  data,
  height,
});

export const useBottomSheetState = () => {
  const router = useRouter();
  const data = useStateStore(store, selector);

  const openSheetWithInternal = useStableCallback(
    (openData: BottomSheetData) => {
      router.push('/overlay/sheet');
      openSheetWith(openData);
    },
  );

  const closeSheetInternal = useStableCallback(() => {
    router.back();
    closeSheet();
  });

  return {
    ...data,
    openSheetWith: openSheetWithInternal,
    closeSheet: closeSheetInternal,
  };
};
