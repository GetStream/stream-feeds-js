export const checkHasAnotherPage = <T extends unknown | undefined>(
  v: T,
  cursor: string | undefined,
) =>
  (typeof v === 'undefined' && typeof cursor === 'undefined') ||
  typeof cursor === 'string';
