import React, { useMemo } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { useBottomSheetState } from '@/hooks/useBottomSheetState';
import { CommentSheet } from '@/components/BottomSheet/CommentSheet';
import { ActivitySheet } from '@/components/BottomSheet/ActivitySheet';

export default function SheetOverlay() {
  const { data } = useBottomSheetState();
  const innerSheet = useMemo(
    () => (data?.type === 'comment' ? <CommentSheet /> : <ActivitySheet />),
    [data?.type],
  );
  return <BottomSheet>{innerSheet}</BottomSheet>;
}
