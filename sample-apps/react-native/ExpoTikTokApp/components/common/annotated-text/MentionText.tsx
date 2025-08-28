import { TextProps } from 'react-native';
import { useCallback, useMemo } from 'react';
import { CommentParent } from '@stream-io/feeds-react-native-sdk';
import { useStableCallback } from '@/hooks/useStableCallback';
import { useRouter } from 'expo-router';
import { MentionPreview } from '@/components/common/annotated-text/MentionPreview';
import { AnnotatedText } from '@/components/common/annotated-text/AnnotatedText';

export const MentionText = ({
  entity,
  ...rest
}: { entity: CommentParent } & TextProps) => {
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

  const annotations = useMemo(
    () => ({
      mention: {
        matching: '@',
        name: 'mention',
        onPress: onPressMention,
        Component: MentionPreviewComponent,
      },
    }),
    [MentionPreviewComponent, onPressMention],
  );

  return (
    <AnnotatedText
      text={entity.text ?? ''}
      annotations={annotations}
      {...rest}
    />
  );
};
