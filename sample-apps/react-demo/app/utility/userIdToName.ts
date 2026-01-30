export const userIdToName = (str: string) => {
  return str.replaceAll('-', ' ').charAt(0).toUpperCase() + str.slice(1);
};
