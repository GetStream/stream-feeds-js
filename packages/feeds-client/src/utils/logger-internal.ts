import { isReactNative } from './is-react-native';

export enum LogLevelEnum {
  trace,
  debug,
  info,
  warn,
  error,
}

export type LogLevel = keyof typeof LogLevelEnum;
export type Sink = (
  logLevel: LogLevel,
  message: string,
  ...data: any[]
) => void;

const logToConsole: Sink = (logLevel, message, ...rest) => {
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

const DEFAULT_LOG_LEVEL: LogLevel = 'info';
const DEFAULT_SINK: Sink = logToConsole;

const sinkByScope = new Map<string, Sink>([['default', DEFAULT_SINK]]);
const logLevelByScope = new Map<string, LogLevel>([
  ['default', DEFAULT_LOG_LEVEL],
]);

export type Logger<T extends string> = ReturnType<typeof getLogger<T>>;

export const getLogger = <T extends string>(
  scope: T,
  options: { tags?: string[] } = {},
) => {
  const tagString = (options.tags ?? []).filter(Boolean).join(',');

  const constructLogFunction =
    (logLevel: LogLevel) =>
    (message: string, ...data: any[]) => {
      const scopedLogLevel =
        logLevelByScope.get(scope) ?? logLevelByScope.get('default')!;

      if (LogLevelEnum[logLevel] >= LogLevelEnum[scopedLogLevel]) {
        const scopedSink =
          sinkByScope.get(scope) ?? sinkByScope.get('default')!;

        scopedSink(
          logLevel,
          `[${scope}]${tagString.length ? `(${tagString})` : ''}: ${message}`,
          ...data,
        );
      }
    };

  return {
    withExtraTags: (...extraTags: string[]) => {
      return getLogger(scope, {
        ...options,
        tags: options.tags ? options.tags.concat(extraTags) : extraTags,
      });
    },
    ...({
      error: constructLogFunction('error'),
      trace: constructLogFunction('trace'),
      debug: constructLogFunction('debug'),
      info: constructLogFunction('info'),
      warn: constructLogFunction('warn'),
    } satisfies Record<LogLevel, ReturnType<typeof constructLogFunction>>),
  };
};

/**
 * Configuration options for `configureLoggers`, where keys are logger scopes.
 * The `default` scope is reserved and is used to set default options for all loggers.
 *
 * To reset a specific scope settings, set its `sink` or `level` to `null`. To reset all scopes
 * to default settings, use `restoreDefaults()` function.
 */
export type ConfigureLoggersOptions<T extends string> = T extends 'default'
  ? never
  : Partial<{
      [K in T | 'default']: Partial<{
        sink: K extends 'default' ? Sink : Sink | null;
        level: K extends 'default' ? LogLevel : LogLevel | null;
      }>;
    }>;

export const configureLoggers = <T extends string>(
  optionsByScope?: ConfigureLoggersOptions<T>,
) => {
  for (const scope in optionsByScope) {
    const options = optionsByScope[scope]!;

    if (options.sink) {
      sinkByScope.set(scope, options.sink);
    } else if (options.sink === null && scope !== 'default') {
      sinkByScope.delete(scope);
    }

    if (options.level) {
      logLevelByScope.set(scope, options.level);
    } else if (options.level === null && scope !== 'default') {
      logLevelByScope.delete(scope);
    }
  }
};

export const restoreDefaults = () => {
  sinkByScope.clear();
  logLevelByScope.clear();
  sinkByScope.set('default', DEFAULT_SINK);
  logLevelByScope.set('default', DEFAULT_LOG_LEVEL);
};
