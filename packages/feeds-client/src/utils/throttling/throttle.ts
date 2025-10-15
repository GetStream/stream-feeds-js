export type ThrottledCallback = (...args: unknown[]) => unknown;

export type ThrottledFunction<T extends unknown[]> =
  ((...args: T) => void);

/**
 * Throttle a function so it runs at most once per `timeout` ms.
 *
 * - `leading`: fire immediately when the window opens
 * - `trailing`: remember the latest args/this and fire once when the window closes
 *
 * defaults: `{ leading: true, trailing: false }`
 *
 * notes:
 * - make one throttled instance and reuse it; re-creating it resets internal state
 *
 * @typeParam T - the function type being throttled
 * @param fn - function to throttle
 * @param timeout - minimum time between invocations (ms)
 * @param options - behavior switches
 * @param options.leading - call on the leading edge (default: true)
 * @param options.trailing - call once at the end of the window with the latest args (default: false)
 * @returns a throttled function with the same call signature as `fn`
 *
 * @example
 * const send = (payload: Data) => api.post('/endpoint', payload);
 * const sendThrottled = throttle(send, 2000, { leading: true, trailing: true });
 * // call `sendThrottled` freely; it won’t invoke `send` more than once every 2s
 */
export const throttle = <T extends unknown[]>(
  fn: (...args: T) => void,
  timeout = 200,
  { leading = true, trailing = false }: { leading?: boolean; trailing?: boolean } = {},
) => {
  let timer: NodeJS.Timeout | null = null;
  let storedArgs: T | null = null;
  let storedThis: unknown = null;
  let lastInvokeTime: number | undefined; // timestamp of last actual invocation

  const invoke = (args: T, thisArg: unknown) => {
    lastInvokeTime = Date.now();
    fn.apply(thisArg, args);
  };

  const scheduleTrailing = (delay: number) => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      if (trailing && storedArgs) {
        invoke(storedArgs, storedThis);
        storedArgs = null;
        storedThis = null;
      }
    }, delay);
  };

  return function (this: unknown, ...args: T) {
    const now = Date.now();

    const hasBeenInvoked = lastInvokeTime != null;

    // if we have never invoked and `leading` is `false`, treat `lastInvokeTime` as now
    if (!hasBeenInvoked && !leading) lastInvokeTime = now;

    const timeSinceLast = hasBeenInvoked ? (now - lastInvokeTime!) : timeout;
    const remaining = timeout - timeSinceLast;

    // capture latest args for possible trailing invocation
    if (trailing) {
      storedArgs = args;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      storedThis = this;
    }

    // if enough time has passed, invoke immediately
    if (remaining <= 0) {
      // if there's a pending timer, clear it because we're invoking now
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      // leading: call now
      if (leading) {
        // if trailing is also `true`, we've already stored args above;
        // make sure we don't call the same args twice
        if (trailing) {
          // if the `storedArgs` are exactly the args we're about to call,
          // clear storedArgs to avoid double invocation by trailing (comparing
          // by reference is fine because the `args` array is new each call)
          if (storedArgs === args) {
            storedArgs = null;
            storedThis = null;
          }
        }
        invoke(args, this);
      } else {
        // not leading but trailing: schedule a trailing call after `timeout`
        if (trailing) scheduleTrailing(timeout);
      }

      return;
    }

    // not enough time passed: we're in cooldown, so if
    // trailing is requested, ensure a trailing invocation
    // is scheduled at the end of the remaining time
    if (trailing && !timer) {
      scheduleTrailing(remaining);
    }
    // if `trailing` is `false`, we simply drop the call (throttle)
  };
};
