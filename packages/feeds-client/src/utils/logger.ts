import * as loggerInternal from '@stream-io/logger';

type AvailableScopes =
  | 'api-client'
  | 'event-dispatcher'
  | 'token-manager'
  | 'stable-ws-connection'
  | 'helpers';

export type ConfigureLoggersOptions =
  loggerInternal.ConfigureLoggersOptions<AvailableScopes>;
export type Logger = loggerInternal.Logger<AvailableScopes>;

export const feedsLoggerSystem =
  loggerInternal.createLoggerSystem<AvailableScopes>();

export type { LogLevel, Sink } from '@stream-io/logger';
export { LogLevelEnum } from '@stream-io/logger';
