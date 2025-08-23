export const findMentionedUsers = (text: string) => {
  const matches = text.match(/(?<![\w@])@[A-Za-z0-9_.]+/g);

  return matches?.map((match) => match.slice(1));
}
