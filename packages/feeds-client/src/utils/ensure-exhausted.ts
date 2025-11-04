import { feedsLoggerSystem } from './logger';

export const ensureExhausted = (x: never, message: string) => {
  feedsLoggerSystem.getLogger('helpers').warn(message, x);
};
