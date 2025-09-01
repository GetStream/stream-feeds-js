import { TextProps } from 'react-native';
import { useMemo } from 'react';
import { CommentParent } from '@stream-io/feeds-react-native-sdk';
import { TokenizedText } from '@/components/common/tokenized-text/TokenizedText';
import { useMentionAnnotations } from '@/components/common/tokenized-text/hooks/useMentionAnnotations';

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
    <TokenizedText
      text={entity.text ?? ''}
      annotations={annotations}
      {...rest}
    />
  );
};
