export const sleep = (m: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, m));

export function isFunction<T>(value: Function | T): value is Function {
  return (
    value &&
    (Object.prototype.toString.call(value) === '[object Function]' ||
      typeof value === 'function' ||
      value instanceof Function)
  );
}

/**
 * A map of known error codes.
 */
export const KnownCodes = {
  TOKEN_EXPIRED: 40,
  WS_CLOSED_SUCCESS: 1000,
  WS_CLOSED_ABRUPTLY: 1006,
  WS_POLICY_VIOLATION: 1008,
};

/**
 * retryInterval - A retry interval which increases acc to number of failures
 *
 * @return {number} Duration to wait in milliseconds
 */
export function retryInterval(numberOfFailures: number) {
  // try to reconnect in 0.25-5 seconds (random to spread out the load from failures)
  const max = Math.min(500 + numberOfFailures * 2000, 5000);
  const min = Math.min(Math.max(250, (numberOfFailures - 1) * 2000), 5000);
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomId() {
  return generateUUIDv4();
}

// https://tools.ietf.org/html/rfc4122
export function generateUUIDv4() {
  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version
  bytes[8] = (bytes[8] & 0xbf) | 0x80; // variant

  return (
    hex(bytes.subarray(0, 4)) +
    '-' +
    hex(bytes.subarray(4, 6)) +
    '-' +
    hex(bytes.subarray(6, 8)) +
    '-' +
    hex(bytes.subarray(8, 10)) +
    '-' +
    hex(bytes.subarray(10, 16))
  );
}

function hex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, '0');
  }
  return s;
}

function getRandomValuesWithMathRandom(bytes: Uint8Array): void {
  const max = Math.pow(2, (8 * bytes.byteLength) / bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.random() * max;
  }
}
declare const msCrypto: Crypto;

const getRandomValues = (() => {
  return getRandomValuesWithMathRandom;
})();

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  getRandomValues(bytes);
  return bytes;
}

/**
 * listenForConnectionChanges - Adds an event listener fired on browser going online or offline
 */
export function addConnectionEventListeners(cb: (e: Event) => void) {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('offline', cb);
    window.addEventListener('online', cb);
  }
}

export function removeConnectionEventListeners(cb: (e: Event) => void) {
  if (typeof window !== 'undefined' && window.removeEventListener) {
    window.removeEventListener('offline', cb);
    window.removeEventListener('online', cb);
  }
}

export const streamDevToken = (userId: string) => {
  return [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // {"alg": "HS256", "typ": "JWT"}
    window.btoa(JSON.stringify({ user_id: userId })),
    'devtoken', // hardcoded signature
  ].join('.');
};


export interface DebouncedFunc<T extends (...args: any[]) => any> {
  /**
   * Call the original function, but applying the debounce rules.
   *
   * If the debounced function can be run immediately, this calls it and returns its return
   * value.
   *
   * Otherwise, it returns the return value of the last invocation, or undefined if the debounced
   * function was not invoked yet.
   */
  (...args: Parameters<T>): ReturnType<T> | undefined;

  /**
   * Throw away any pending invocation of the debounced function.
   */
  cancel(): void;

  /**
   * If there is a pending invocation of the debounced function, invoke it immediately and return
   * its return value.
   *
   * Otherwise, return the value from the last invocation, or undefined if the debounced function
   * was never invoked.
   */
  flush(): ReturnType<T> | undefined;
}

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  timeout = 0,
  {
    leading = false,
    trailing = true,
  }: { leading?: boolean; trailing?: boolean } = {},
): DebouncedFunc<T> => {
  let runningTimeout: null | NodeJS.Timeout = null;
  let argsForTrailingExecution: Parameters<T> | null = null;
  let lastResult: ReturnType<T> | undefined;

  const debouncedFn = (...args: Parameters<T>) => {
    if (runningTimeout) {
      clearTimeout(runningTimeout);
    } else if (leading) {
      lastResult = fn(...args);
    }
    if (trailing) argsForTrailingExecution = args;

    const timeoutHandler = () => {
      if (argsForTrailingExecution) {
        lastResult = fn(...argsForTrailingExecution);
        argsForTrailingExecution = null;
      }
      runningTimeout = null;
    };

    runningTimeout = setTimeout(timeoutHandler, timeout);
    return lastResult;
  };

  debouncedFn.cancel = () => {
    if (runningTimeout) clearTimeout(runningTimeout);
  };

  debouncedFn.flush = () => {
    if (runningTimeout) {
      clearTimeout(runningTimeout);
      runningTimeout = null;
      if (argsForTrailingExecution) {
        lastResult = fn(...argsForTrailingExecution);
      }
    }
    return lastResult;
  };
  return debouncedFn;
};

export const capitalize = <T extends string>(s: T) => {
  return `${s.charAt(0).toLocaleUpperCase()}${s.slice(1)}` as Capitalize<T>;
};
