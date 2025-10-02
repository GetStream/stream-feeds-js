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

export const replaceUniqueArrayMerge = <T>(
  existingArray: T[],
  arrayToMerge: T[],
  getKey: (v: T) => string,
) => {
  const existingMap = new Map<string, T>();
  (existingArray ?? []).forEach((item) => {
    existingMap.set(getKey(item), item);
  });

  const result: T[] = [];
  arrayToMerge.forEach((item) => {
    existingMap.set(getKey(item), item);
  });

  existingArray.forEach((originalItem) => {
    const updatedItem = existingMap.get(getKey(originalItem));
    if (updatedItem) {
      result.push(updatedItem);
      existingMap.delete(getKey(originalItem));
    }
  });

  existingMap.forEach((item) => {
    result.push(item);
  });

  return result;
};
