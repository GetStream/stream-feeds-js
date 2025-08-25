import React, { useMemo } from 'react';
import { BottomSheet } from '@/components/bottom-sheet';
import { useBottomSheetState } from '@/hooks/useBottomSheetState';
import { CommentSheet } from '@/components/bottom-sheet/CommentSheet';
import { ActivitySheet } from '@/components/bottom-sheet/ActivitySheet';

export default function SheetOverlay() {
  const { data } = useBottomSheetState();
  const innerSheet = useMemo(
    () => (data?.type === 'comment' ? <CommentSheet /> : <ActivitySheet />),
    [data?.type],
  );
  return <BottomSheet>{innerSheet}</BottomSheet>;
}
