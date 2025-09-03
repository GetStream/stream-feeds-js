import { isReactNative } from './is-react-native';

export type Logger = (
  logLevel: LogLevel,
  message: string,
  ...args: unknown[]
) => void;

export type LogLevel = keyof typeof logLevels;

// log levels, sorted by verbosity
export const logLevels = Object.freeze({
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const);

let moduleLogger: Logger | undefined;
let moduleLogLevel: LogLevel = 'info';

export const logToConsole: Logger = (logLevel, message, ...args) => {
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

  logMethod(message, ...args);
};

export const setLogger = (logger: Logger = logToConsole, level?: LogLevel) => {
  moduleLogger = logger;
  if (level) {
    setLogLevel(level);
  }
};

export const setLogLevel = (level: LogLevel) => {
  moduleLogLevel = level;
};

export const getLogLevel = (): LogLevel => moduleLogLevel;

export const getLogger = (...withTags: string[]) => {
  const loggerMethod = moduleLogger || logToConsole;

  const tags = (withTags || []).filter(Boolean).join(':');

  return ((logLevel, message, ...args) => {
    if (logLevels[logLevel] >= logLevels[moduleLogLevel]) {
      loggerMethod(logLevel, `[${tags}]: ${message}`, ...args);
    }
  }) satisfies Logger;
};
