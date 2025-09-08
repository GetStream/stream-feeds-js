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

export const logToConsole: Sink = (logLevel, message, ...rest) => {
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

const sinkByScope = new Map<string, Sink>();
const logLevelByScope = new Map<string, LogLevel>();

export let defaultLogLevel: LogLevel = 'info';
export let defaultSink: Sink = logToConsole;

export const getLogger = <T extends string>(
  scope: T,
  options: { tags?: string[] } = {},
) => {
  const constructLogFunction =
    (logLevel: LogLevel) =>
    (message: string, ...data: any[]) => {
      const scopedSink = sinkByScope.get(scope) ?? defaultSink;
      const scopedLogLevel = logLevelByScope.get(scope) ?? defaultLogLevel;
      const tagString = (options.tags ?? []).filter(Boolean).join(',');

      if (LogLevelEnum[logLevel] >= LogLevelEnum[scopedLogLevel]) {
        scopedSink(
          logLevel,
          `[${scope}]${tagString.length ? `(${tagString})` : ''}: ${message}`,
          ...data,
        );
      }

      return [message, ...data];
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

export type ConfigureLoggersOptions<T extends string> = Partial<
  Record<
    T,
    Partial<{
      sink: Sink;
      level: LogLevel;
    }>
  >
>;

export const configureLoggers = <T extends string>(
  optionsByScope: ConfigureLoggersOptions<T>,
) => {
  for (const option in optionsByScope) {
    const options = optionsByScope[option]!;

    if (option === 'default') {
      if (options.sink) {
        defaultSink = options.sink;
      }
      if (options.level) {
        defaultLogLevel = options.level;
      }
      continue;
    }

    if (options.sink) {
      sinkByScope.set(option, options.sink);
    }
    if (options.level) {
      logLevelByScope.set(option, options.level);
    }
  }
};
