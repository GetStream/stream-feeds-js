import React from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { useBottomSheetState } from '@/hooks/useBottomSheetState';
import { CommentSheet } from '@/components/BottomSheet/CommentSheet';
import { ActivitySheet } from '@/components/BottomSheet/ActivitySheet';

export default function SheetOverlay() {
  const { data } = useBottomSheetState();
  return (
    <BottomSheet>
      {data?.type === 'comment' ? <CommentSheet /> : null}
      {data?.type === 'activity' ? <ActivitySheet /> : null}
    </BottomSheet>
  );
}
