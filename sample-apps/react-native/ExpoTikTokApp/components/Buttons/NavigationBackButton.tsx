import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '@/constants/Colors';
import React from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';

export const NavigationBackButton = ({
  preNavigationCallback,
}: {
  preNavigationCallback?: () => void | (() => Promise<void>);
}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const pressHandler = useStableCallback(async () => {
    if (preNavigationCallback) {
      await preNavigationCallback();
    }
    router.back();
  });

  return (
    <Pressable onPress={pressHandler}>
      {({ pressed }) => (
        <Ionicons
          name="arrow-back"
          size={25}
          color={Colors[colorScheme ?? 'light'].text}
          style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
        />
      )}
    </Pressable>
  );
};
