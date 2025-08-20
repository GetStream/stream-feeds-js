import { PostCreationContextProvider } from '@/contexts/PostCreationContext';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '@/constants/Colors';
import { resetState } from '@/store/activity-action-state-store';

const HeaderLeft = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => {
        resetState();
        router.back();
      }}
    >
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

const PostCreationLayout = () => {
  return (
    <PostCreationContextProvider>
      <Stack>
        <Stack.Screen
          name="create-post-modal"
          options={{
            title: 'New Post',
            headerLeft: HeaderLeft,
          }}
        />
        <Stack.Screen
          name="pick-location-modal"
          options={{
            title: 'Select Location',
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </PostCreationContextProvider>
  );
};

export default PostCreationLayout;
