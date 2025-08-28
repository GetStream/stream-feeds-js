import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';
import { HashtagPreview } from '@/components/hashtags/HashtagPreview';

export const useHashtagAnnotations = () => {
  const router = useRouter();

  const onPressHashtag = useStableCallback((handle: string) => {
    if (handle) {
      router.push({
        pathname: '/hashtag-screen',
        params: { id: handle },
      });
    }
  });

  const HashtagPreviewComponent = useCallback(
    ({ text, handle }: { text: string; handle: string }) => (
      <HashtagPreview
        text={text}
        handle={handle}
        onPressHashtag={onPressHashtag}
      />
    ),
    [onPressHashtag],
  );

  return useMemo(
    () => ({
      matching: '#',
      name: 'hashtag',
      onPress: onPressHashtag,
      Component: HashtagPreviewComponent,
    }),
    [HashtagPreviewComponent, onPressHashtag],
  );
};
