import { describe, it } from 'vitest';
import { feedsLoggerSystem } from '../../src/utils';

describe('Logging page', () => {
  it('configure loggers per scope', () => {
    feedsLoggerSystem.configureLoggers({
      'api-client': {
        level: 'error',
      },
      'event-dispatcher': {
        level: 'warn',
        sink: (logLevel, message, ...rest) => {
          switch (logLevel) {
            case 'warn': {
              console.warn(message, ...rest);
              break;
            }
            case 'error': {
              console.error(message, ...rest);
            }
          }
        },
      },
    });
  });

  it('augment default scope', () => {
    feedsLoggerSystem.configureLoggers({
      default: {
        level: 'info',
        sink: (logLevel, message, ...rest) => {
          console.log(logLevel, message, ...rest);
        },
      },
    });
  });

  it('reset specific scope to defaults', () => {
    feedsLoggerSystem.configureLoggers({
      'event-dispatcher': {
        level: null,
        sink: null,
      },
    });
  });

  it('restore all defaults', () => {
    feedsLoggerSystem.restoreDefaults();
  });
});
