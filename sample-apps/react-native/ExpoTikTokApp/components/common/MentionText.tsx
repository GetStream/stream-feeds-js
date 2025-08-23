import React, { useMemo } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useStableCallback } from '@/hooks/useStableCallback';
import { UserResponse } from '@stream-io/feeds-react-native-sdk';
import { useRouter } from 'expo-router';

type MentionTextProps = TextProps & {
  text: string;
  mentionedUsers: UserResponse[];
};

const MENTION_RE = /(^|[^\w@])@([A-Za-z0-9_.]+)/g; // avoids emails

export const MentionText = ({
  text,
  style,
  mentionedUsers,
  ...rest
}: MentionTextProps) => {
  const router = useRouter();

  const mentionsById = useMemo(
    () => Object.fromEntries(mentionedUsers.map((o) => [String(o.id), o])),
    [mentionedUsers],
  );
  const parts = useMemo(() => {
    const out: Array<{ text: string; handle?: string }> = [];
    let last = 0;
    let m: RegExpExecArray | null;
    const re = new RegExp(MENTION_RE);
    while ((m = re.exec(text)) !== null) {
      const atIndex = m.index + m[1].length;
      if (atIndex > last) out.push({ text: text.slice(last, atIndex) });
      const handle = m[2];
      out.push({ text: '@' + handle, handle });
      last = atIndex + 1 + handle.length;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out;
  }, [text]);

  const onPressMention = useStableCallback((handle: string) => {
    const mentionedUser = mentionsById[handle];

    if (mentionedUser) {
      router.push({
        pathname: '/user-profile-screen',
        params: { userId: handle },
      });
    }
  });

  return (
    <Text style={style} {...rest}>
      {parts.map((part, index) =>
        part.handle ? (
          <Text
            key={index}
            style={styles.mention}
            onPress={
              onPressMention ? () => onPressMention(part.handle!) : undefined
            }
            accessibilityRole="link"
          >
            {part.text}
          </Text>
        ) : (
          <Text key={index}>{part.text}</Text>
        ),
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  mention: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
