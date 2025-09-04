import { isReactNative } from './is-react-native';

type LogMethod = (
  logLevel: LogLevel,
  message: string,
  ...rest: unknown[]
) => void;

export interface Logger {
  (..._: Parameters<LogMethod>): void;
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

let moduleLogMethod: LogMethod | undefined;
let moduleLogLevel: LogLevel = 'info';

export const logToConsole: LogMethod = (logLevel, message, ...rest) => {
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

export const setLogger = (
  logger: LogMethod = logToConsole,
  level?: LogLevel,
) => {
  moduleLogMethod = logger;
  if (level) {
    setLogLevel(level);
  }
};

export const setLogLevel = (level: LogLevel) => {
  moduleLogLevel = level;
};

export const getLogLevel = (): LogLevel => moduleLogLevel;

export const getLogger = (...withTags: string[]): Logger => {
  const loggerMethod = moduleLogMethod || logToConsole;

  const tags = (withTags || []).filter(Boolean).join(':');

  const logger: Logger = (logLevel, message, ...rest) => {
    if (logLevels[logLevel] >= logLevels[moduleLogLevel]) {
      loggerMethod(logLevel, `[${tags}]: ${message}`, ...rest);
    }
  };

  logger.logAndReturn = (
    e,
    message = e instanceof Error ? e.message : `${e}`,
    ...rest
  ) => {
    logger('error', message, ...rest);

    throw e;
  };

  return logger;
};
