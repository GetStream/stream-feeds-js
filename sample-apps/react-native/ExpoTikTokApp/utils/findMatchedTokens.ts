export const findMatchedTokens = ({
  text,
  matcher,
}: {
  text: string;
  matcher: string;
}) => {
  // Escape regex special chars in matcher to avoid issues
  const escapedMatcher = matcher.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Build regex dynamically
  const regex = new RegExp(
    `(?<![\\w${escapedMatcher}])${escapedMatcher}[A-Za-z0-9_.]+`,
    'g',
  );

  const matches = text.match(regex);

  // Strip matcher prefix before returning
  return matches?.map((match) => match.slice(matcher.length));
};
