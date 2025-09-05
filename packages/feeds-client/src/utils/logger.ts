import { isReactNative } from './is-react-native';

export type LogFunction = (
  logLevel: LogLevel,
  message: string,
  ...rest: unknown[]
) => void;

export interface Logger {
  (..._: Parameters<LogFunction>): void;
  logAndReturn<T>(e: T, message?: string, ...rest: unknown[]): T;
}

export type LogLevel = keyof typeof logLevels;

// log levels, sorted by verbosity
export const logLevels = Object.freeze({
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const);

let moduleLogFunction: LogFunction | undefined;
let moduleLogLevel: LogLevel = 'info';

export const logToConsole: LogFunction = (logLevel, message, ...rest) => {
  let logMethod;
  switch (logLevel) {
    case 'error':
      if (isReactNative()) {
        message = `ERROR: ${message}`;
        logMethod = console.info;
        break;
      }
      logMethod = console.error;
      break;
    case 'warn':
      if (isReactNative()) {
        message = `WARN: ${message}`;
        logMethod = console.info;
        break;
      }
      logMethod = console.warn;
      break;
    case 'info':
      logMethod = console.info;
      break;
    case 'trace':
      logMethod = console.trace;
      break;
    default:
      logMethod = console.log;
      break;
  }

  logMethod(message, ...rest);
};

export const setLogFunction = (
  logFunction: LogFunction = logToConsole,
  level?: LogLevel,
) => {
  moduleLogFunction = logFunction;
  if (level) {
    setLogLevel(level);
  }
};

export const setLogLevel = (level: LogLevel) => {
  moduleLogLevel = level;
};

export const getLogLevel = (): LogLevel => moduleLogLevel;

export const getLogger = (...withTags: string[]): Logger => {
  const logFunction = moduleLogFunction ?? logToConsole;

  const tags = withTags.filter(Boolean).join(':');

  const logger: Logger = (logLevel, message, ...rest) => {
    if (logLevels[logLevel] >= logLevels[moduleLogLevel]) {
      logFunction(logLevel, `[${tags}]: ${message}`, ...rest);
    }
  };

  logger.logAndReturn = (
    e,
    message = e instanceof Error ? e.message : `${e}`,
    ...rest
  ) => {
    logger('error', message, ...rest);

    return e;
  };

  return logger;
};
