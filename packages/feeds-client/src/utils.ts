export const isImageFile = (file: File) => {
  // photoshop files begin with 'image/'
  return file.type.startsWith('image/') && !file.type.endsWith('.photoshop');
};

export const Constants = {
  END_OF_LIST: 'eol',
  DEFAULT_COMMENT_PAGINATION: 'first',
} as const;