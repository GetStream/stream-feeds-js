import { retryInterval, sleep } from '../common/utils';
import { StreamApiError } from '../common/types';

export type RetryOptions = {
  maxRetries?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const DEFAULT_MAX_RETRIES = 3;

/**
 * Checks if an error is a client error (4xx HTTP status code) that should not be retried.
 * Client errors indicate issues with the request itself (bad input, unauthorized, not found, etc.)
 * and retrying won't help.
 *
 * @param error - The error to check
 * @returns true if the error should be retried, false if it's a client error
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof StreamApiError) {
    const statusCode = error.metadata?.response_code;
    // Don't retry on 4xx client errors
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return false;
    }
  }
  return true;
}

/**
 * Wraps an async function with automatic retry logic using exponential backoff.
 *
 * By default, retries are performed for server errors (5xx) and network errors,
 * but not for client errors (4xx) which indicate issues with the request itself.
 *
 * @param fn - The async function to retry
 * @param options - Retry options
 * @returns The result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = DEFAULT_MAX_RETRIES, shouldRetry } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        throw error;
      }

      // Use custom shouldRetry if provided, otherwise use default behavior
      const shouldRetryResult = shouldRetry
        ? shouldRetry(error, attempt)
        : isRetryableError(error);

      if (!shouldRetryResult) {
        throw error;
      }

      const delay = retryInterval(attempt + 1);
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}
