export const ensureExhausted = (x: never, message: string) => {
  // FIXME: Use a proper logger here.
  console.warn(message, x);
};
