export const uniqueArrayMerge = <T>(
  existingArray: T[],
  arrayToMerge: T[],
  getKey: (v: T) => string,
) => {
  const existing = new Set<string>();

  existingArray.forEach((value) => {
    const key = getKey(value);
    existing.add(key);
  });

  const filteredArrayToMerge = arrayToMerge.filter((value) => {
    const key = getKey(value);
    return !existing.has(key);
  });

  return existingArray.concat(filteredArrayToMerge);
};
