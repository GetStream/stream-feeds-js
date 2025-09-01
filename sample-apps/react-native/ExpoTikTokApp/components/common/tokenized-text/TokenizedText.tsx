import React, { useMemo } from 'react';
import { Text, TextProps } from 'react-native';

export type TokenizerConfig = {
  matching: string;
  name: string;
  Component: React.ComponentType<{ text: string, handle: string }>;
};

export type TokenizedTextProps = TextProps & {
  text: string;
  annotations?: Record<string, TokenizerConfig>;
};

export type Part = {
  text: string;
  entity?: {
    name: string;
    matcher: string;
    value: string;
  };
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const TokenizedText = ({
  text,
  style,
  annotations = {},
  ...rest
}: TokenizedTextProps) => {
  const regex = useMemo(() => {
    const escapedMatchers = Object.values(annotations).map((m) =>
      escapeRe(m.matching),
    );
    const disallowSet = `\\w${escapedMatchers.join('')}`;
    const alternation = `(?:${escapedMatchers.join('|')})`;

    return new RegExp(
      `(^|[^${disallowSet}])(${alternation})([A-Za-z0-9_.]+)`,
      'g',
    );
  }, [annotations]);

  const parts: Part[] = useMemo(() => {
    const out: Part[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    const re = new RegExp(regex.source, regex.flags);

    const matcherByChar = Object.fromEntries(
      Object.values(annotations).map((o) => [String(o.matching), o]),
    );

    while ((m = re.exec(text)) !== null) {
      const prefixLen = m[1]?.length ?? 0;
      const atIndex = m.index + prefixLen;

      if (atIndex > last) {
        out.push({ text: text.slice(last, atIndex) });
      }

      const matcher = m[2];
      const value = m[3];
      const name = matcherByChar[matcher]?.name ?? 'entity';

      out.push({
        text: matcher + value,
        entity: { name, matcher, value },
      });

      last = atIndex + matcher.length + value.length;
    }

    if (last < text.length) out.push({ text: text.slice(last) });

    return out;
  }, [regex, annotations, text]);

  return (
    <Text style={style} {...rest}>
      {parts.map((part, index) =>
        part.entity ? (
          <TokenizedTextPart
            key={index}
            part={part}
            PartComponent={annotations[part.entity?.name].Component}
          />
        ) : (
          <Text key={index}>{part.text}</Text>
        ),
      )}
    </Text>
  );
};

const TokenizedTextPart = ({
  part,
  PartComponent,
}: {
  part: Part;
  PartComponent: TokenizerConfig['Component'];
}) => <PartComponent handle={part.entity?.value ?? ''} text={part.text} />;
