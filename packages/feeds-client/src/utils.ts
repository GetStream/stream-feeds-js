export const isImageFile = (file: File) => {
  // photoshop files begin with 'image/'
  return file.type.startsWith('image/') && !file.type.endsWith('.photoshop');
};

export const checkHasAnotherPage = <T extends unknown | undefined>(
  v: T,
  cursor: string | undefined,
) =>
  (typeof v === 'undefined' && typeof cursor === 'undefined') ||
  typeof cursor === 'string';

export const Constants = {
  DEFAULT_COMMENT_PAGINATION: 'first',
} as const;
