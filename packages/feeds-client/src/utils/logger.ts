import * as loggerInternal from './logger-internal';

type AvailableScopes =
  | 'api-client'
  | 'ws-event'
  | 'token-manager'
  | 'stable-ws-connection'
  | 'event-dispatcher';

export type ConfigureLoggersOptions =
  loggerInternal.ConfigureLoggersOptions<AvailableScopes>;
export type Logger = loggerInternal.Logger<AvailableScopes>;

export const configureLoggers =
  loggerInternal.configureLoggers<AvailableScopes>;
export const getLogger = loggerInternal.getLogger<AvailableScopes>;

export type { LogLevel, Sink } from './logger-internal';
export { LogLevelEnum, defaultLogLevel, defaultSink } from './logger-internal';
