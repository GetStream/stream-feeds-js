import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withRetry, isRetryableError } from './retry';
import { StreamApiError } from '../common/types';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const resultPromise = withRetry(fn);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max retries exceeded', async () => {
    const error = new Error('persistent failure');
    const fn = vi.fn().mockRejectedValue(error);

    const resultPromise = withRetry(fn, { maxRetries: 2 });
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('persistent failure');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should respect maxRetries option', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    const resultPromise = withRetry(fn, { maxRetries: 5 });
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('fail');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(6); // initial + 5 retries
  });

  it('should use default maxRetries of 3', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    const resultPromise = withRetry(fn);
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('fail');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(4); // initial + 3 retries
  });

  it('should stop retrying if shouldRetry returns false', async () => {
    const error = new Error('non-retryable');
    const fn = vi.fn().mockRejectedValue(error);
    const shouldRetry = vi.fn().mockReturnValue(false);

    const resultPromise = withRetry(fn, { shouldRetry });
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('non-retryable');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(error, 0);
  });

  it('should pass attempt number to shouldRetry', async () => {
    const error = new Error('fail');
    const fn = vi.fn().mockRejectedValue(error);
    const shouldRetry = vi.fn().mockReturnValue(true);

    const resultPromise = withRetry(fn, { maxRetries: 2, shouldRetry });
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('fail');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(shouldRetry).toHaveBeenCalledTimes(2); // not called on last attempt
    expect(shouldRetry).toHaveBeenNthCalledWith(1, error, 0);
    expect(shouldRetry).toHaveBeenNthCalledWith(2, error, 1);
  });

  it('should wait between retries', async () => {
    // Mock Math.random to return 0.5 for deterministic delay calculation
    // With numberOfFailures=1: max=2500, min=250, delay = 250 + 0.5 * (2500-250) = 1375ms
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn);

    // First call happens immediately
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time but not enough for retry
    await vi.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance past the delay (1375ms total needed)
    await vi.advanceTimersByTimeAsync(1000);
    expect(fn).toHaveBeenCalledTimes(2);

    const result = await resultPromise;
    expect(result).toBe('success');

    randomSpy.mockRestore();
  });

  it('should handle zero maxRetries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    const resultPromise = withRetry(fn, { maxRetries: 0 });
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('fail');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not retry on 4xx client errors by default', async () => {
    const clientError = new StreamApiError('Bad Request', { response_code: 400 }, 4);
    const fn = vi.fn().mockRejectedValue(clientError);

    const resultPromise = withRetry(fn);
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('Bad Request');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(1); // No retries
  });

  it('should retry on 5xx server errors by default', async () => {
    const serverError = new StreamApiError('Internal Server Error', { response_code: 500 }, 16);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(serverError)
      .mockRejectedValueOnce(serverError)
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should retry on network errors (no response code)', async () => {
    const networkError = new StreamApiError('Network error');
    const fn = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue('success');

    const resultPromise = withRetry(fn);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on 401 Unauthorized', async () => {
    const unauthorizedError = new StreamApiError('Unauthorized', { response_code: 401 }, 40);
    const fn = vi.fn().mockRejectedValue(unauthorizedError);

    const resultPromise = withRetry(fn);
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('Unauthorized');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not retry on 403 Forbidden', async () => {
    const forbiddenError = new StreamApiError('Forbidden', { response_code: 403 }, 17);
    const fn = vi.fn().mockRejectedValue(forbiddenError);

    const resultPromise = withRetry(fn);
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('Forbidden');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not retry on 404 Not Found', async () => {
    const notFoundError = new StreamApiError('Not Found', { response_code: 404 }, 16);
    const fn = vi.fn().mockRejectedValue(notFoundError);

    const resultPromise = withRetry(fn);
    // Set up expectation before running timers to avoid unhandled rejection
    const expectPromise = expect(resultPromise).rejects.toThrow('Not Found');
    await vi.runAllTimersAsync();
    await expectPromise;

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should allow custom shouldRetry to override default behavior', async () => {
    const clientError = new StreamApiError('Bad Request', { response_code: 400 }, 4);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(clientError)
      .mockResolvedValue('success');

    // Custom shouldRetry that always retries
    const shouldRetry = vi.fn().mockReturnValue(true);

    const resultPromise = withRetry(fn, { shouldRetry });
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(shouldRetry).toHaveBeenCalledWith(clientError, 0);
  });
});

describe('isRetryableError', () => {
  it('should return false for 400 Bad Request', () => {
    const error = new StreamApiError('Bad Request', { response_code: 400 });
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for 401 Unauthorized', () => {
    const error = new StreamApiError('Unauthorized', { response_code: 401 });
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for 403 Forbidden', () => {
    const error = new StreamApiError('Forbidden', { response_code: 403 });
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for 404 Not Found', () => {
    const error = new StreamApiError('Not Found', { response_code: 404 });
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for 422 Unprocessable Entity', () => {
    const error = new StreamApiError('Unprocessable Entity', { response_code: 422 });
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return true for 500 Internal Server Error', () => {
    const error = new StreamApiError('Internal Server Error', { response_code: 500 });
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for 502 Bad Gateway', () => {
    const error = new StreamApiError('Bad Gateway', { response_code: 502 });
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for 503 Service Unavailable', () => {
    const error = new StreamApiError('Service Unavailable', { response_code: 503 });
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for StreamApiError without response code (network error)', () => {
    const error = new StreamApiError('Network error');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for regular Error (non-StreamApiError)', () => {
    const error = new Error('Some error');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for unknown error types', () => {
    expect(isRetryableError('string error')).toBe(true);
    expect(isRetryableError({ message: 'object error' })).toBe(true);
    expect(isRetryableError(null)).toBe(true);
    expect(isRetryableError(undefined)).toBe(true);
  });
});
