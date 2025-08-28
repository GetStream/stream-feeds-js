import { TextProps } from 'react-native';
import { useMemo } from 'react';
import { CommentParent } from '@stream-io/feeds-react-native-sdk';
import { AnnotatedText } from '@/components/common/AnnotatedText';
import { useMentionAnnotations } from '@/components/mentions/hooks/useMentionAnnotations';

export const MentionText = ({
  entity,
  ...rest
}: { entity: CommentParent } & TextProps) => {
  const mentionAnnotation = useMentionAnnotations({ entity });

  const annotations = useMemo(
    () => ({ mention: mentionAnnotation }),
    [mentionAnnotation],
  );

  return (
    <AnnotatedText
      text={entity.text ?? ''}
      annotations={annotations}
      {...rest}
    />
  );
};
