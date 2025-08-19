import React from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { useBottomSheetState } from '@/hooks/useBottomSheetState';
import { CommentSheet } from '@/components/BottomSheet/CommentSheet';

export default function SheetOverlay() {
  const { data } = useBottomSheetState();
  return (
    <BottomSheet>
      {data?.type === 'comment' ? <CommentSheet /> : null}
    </BottomSheet>
  );
}
