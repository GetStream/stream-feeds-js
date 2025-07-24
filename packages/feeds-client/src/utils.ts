import { CommentParent, StreamFile } from './types';
import type { CommentResponse } from './gen/models';

export const isImageFile = (file: StreamFile) => {
  // photoshop files begin with 'image/'
  return file.type.startsWith('image/') && !file.type.endsWith('.photoshop');
};

export const isVideoFile = (file: StreamFile) => {
  return file.type.startsWith('video/');
};

export const checkHasAnotherPage = <T extends unknown | undefined>(
  v: T,
  cursor: string | undefined,
) =>
  (typeof v === 'undefined' && typeof cursor === 'undefined') ||
  typeof cursor === 'string';

export const isCommentResponse = (
  entity: CommentParent,
): entity is CommentResponse => {
  return typeof (entity as CommentResponse)?.object_id === 'string';
};

export const Constants = {
  DEFAULT_COMMENT_PAGINATION: 'first',
} as const;

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
