import type { TextProps } from 'react-native';
import { useMemo } from 'react';
import type { CommentParent } from '@stream-io/feeds-react-native-sdk';
import { TokenizedText } from '@/components/common/tokenized-text/TokenizedText';
import { useMentionAnnotations } from '@/components/common/tokenized-text/hooks/useMentionAnnotations';
import { useHashtagAnnotations } from '@/components/common/tokenized-text/hooks/useHashtagAnnotations';

export const AnnotatedText = ({
  entity,
  ...rest
}: { entity: CommentParent } & TextProps) => {
  const mentionAnnotation = useMentionAnnotations({ entity });
  const hashtagAnnotation = useHashtagAnnotations();

  const annotations = useMemo(
    () => ({ mention: mentionAnnotation, hashtag: hashtagAnnotation }),
    [hashtagAnnotation, mentionAnnotation],
  );

  return (
    <TokenizedText
      text={entity.text ?? ''}
      annotations={annotations}
      {...rest}
    />
  );
};
