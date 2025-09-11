import * as loggerInternal from './logger-internal';

type AvailableScopes =
  | 'api-client'
  | 'event-dispatcher'
  | 'token-manager'
  | 'stable-ws-connection';

export type ConfigureLoggersOptions =
  loggerInternal.ConfigureLoggersOptions<AvailableScopes>;
export type Logger = loggerInternal.Logger<AvailableScopes>;

export const configureLoggers =
  loggerInternal.configureLoggers<AvailableScopes>;
export const getLogger = loggerInternal.getLogger<AvailableScopes>;

export type { LogLevel, Sink } from './logger-internal';
export { LogLevelEnum, restoreDefaults } from './logger-internal';
