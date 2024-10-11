import { RateLimit } from './types';

export const getRateLimitFromResponseHeader = (
  responseHeaders: Record<string, string>,
) => {
  const rateLimit = responseHeaders['x-ratelimit-limit']
    ? +responseHeaders['x-ratelimit-limit']!
    : undefined;
  const rateLimitRemaining = responseHeaders['x-ratelimit-remaining']
    ? +responseHeaders['x-ratelimit-remaining']!
    : undefined;
  const rateLimitReset = responseHeaders['x-ratelimit-reset']
    ? new Date(+responseHeaders['x-ratelimit-reset']! * 1000)
    : undefined;

  const result: RateLimit = {
    rateLimit,
    rateLimitRemaining,
    rateLimitReset,
  };

  return result;
};
