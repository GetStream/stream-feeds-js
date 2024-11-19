import { RateLimit } from './types';

export const getRateLimitFromResponseHeader = (
  response_headers: Record<string, string>,
) => {
  const rate_limit = response_headers['x-ratelimit-limit']
    ? +response_headers['x-ratelimit-limit']!
    : undefined;
  const rate_limit_remaining = response_headers['x-ratelimit-remaining']
    ? +response_headers['x-ratelimit-remaining']!
    : undefined;
  const rate_limit_reset = response_headers['x-ratelimit-reset']
    ? new Date(+response_headers['x-ratelimit-reset']! * 1000)
    : undefined;

  const result: RateLimit = {
    rate_limit,
    rate_limit_remaining,
    rate_limit_reset,
  };

  return result;
};
