export type ThrottledCallback = (...args: unknown[]) => unknown;

// works exactly the same as lodash.throttle
export const throttle = <T extends ThrottledCallback>(
  fn: T,
  timeout = 200,
  { leading = true, trailing = false }: { leading?: boolean; trailing?: boolean } = {},
) => {
  let runningTimeout: null | NodeJS.Timeout = null;
  let storedArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    if (runningTimeout) {
      if (trailing) storedArgs = args;
      return;
    }

    if (leading) fn(...args);

    const timeoutHandler = () => {
      if (storedArgs) {
        fn(...storedArgs);
        storedArgs = null;
        runningTimeout = setTimeout(timeoutHandler, timeout);

        return;
      }

      runningTimeout = null;
    };

    runningTimeout = setTimeout(timeoutHandler, timeout);
  };
};
