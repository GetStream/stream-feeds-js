import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useStableCallback } from '@/hooks/useStableCallback';
import { MentionPreview } from '@/components/common/annotated-text/MentionPreview';
import { CommentParent } from '@stream-io/feeds-react-native-sdk';

export const useMentionAnnotations = ({
  entity,
}: {
  entity: CommentParent;
}) => {
  const router = useRouter();

  const mentionsById = useMemo(
    () =>
      Object.fromEntries(entity.mentioned_users.map((o) => [String(o.id), o])),
    [entity.mentioned_users],
  );

  const onPressMention = useStableCallback((handle: string) => {
    const mentionedUser = mentionsById[handle];
    if (mentionedUser) {
      router.push({
        pathname: '/user-profile-screen',
        params: { userId: handle },
      });
    }
  });

  const MentionPreviewComponent = useCallback(
    ({ text, handle }: { text: string; handle: string }) => (
      <MentionPreview
        text={text}
        handle={handle}
        onPressMention={onPressMention}
      />
    ),
    [onPressMention],
  );

  return useMemo(
    () => ({
      matching: '@',
      name: 'mention',
      onPress: onPressMention,
      Component: MentionPreviewComponent,
    }),
    [MentionPreviewComponent, onPressMention],
  );
};
