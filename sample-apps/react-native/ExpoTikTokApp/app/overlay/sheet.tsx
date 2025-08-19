// app/overlay/sheet.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { closeSheet } from '@/store/bottom-sheet-state-store';
import { useRouter } from 'expo-router';
import { BottomSheet } from '@/components/BottomSheet';

export default function SheetOverlay() {
  const router = useRouter();

  // useEffect(() => {
  //   modalRef.current?.present();
  // }, []);

  const close = () => {
    closeSheet();
    router.back();
  };

  return (
    <BottomSheet>
      <View>
        <Text>Custom sheet content</Text>
      </View>
    </BottomSheet>
  );
}
