import { PostCreationContextProvider } from '@/contexts/PostCreationContext';
import { Stack } from 'expo-router';
import React from 'react';
import { resetState } from '@/store/activity-action-state-store';
import { NavigationBackButton } from '@/components/Buttons';

const PostCreationLayout = () => {
  return (
    <PostCreationContextProvider>
      <Stack>
        <Stack.Screen
          name="create-post-modal"
          options={{
            title: 'New Post',
            headerLeft: () => (
              <NavigationBackButton preNavigationCallback={resetState} />
            ),
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
