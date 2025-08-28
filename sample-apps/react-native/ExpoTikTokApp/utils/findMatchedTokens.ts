export const findMatchedTokens = ({
  text,
  matcher,
}: {
  text: string;
  matcher: string;
}) => {
  const escapedMatcher = matcher.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(?<![\\w${escapedMatcher}])${escapedMatcher}[A-Za-z0-9_.]+`,
    'g',
  );

  const matches = text.match(regex);

  return matches?.map((match) => match.slice(matcher.length));
};
