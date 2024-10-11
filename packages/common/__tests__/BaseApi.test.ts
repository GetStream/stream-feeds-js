import { beforeAll, describe, expect, it } from 'vitest';
import { StreamClient } from '../src/StreamClient';
import {
  createTestClient,
  createTestTokenGenerator,
} from './create-test-client';
import { UserRequest } from '../src/gen/models';

describe('API requests and error handling', () => {
  let client: StreamClient;
  const user: UserRequest = { id: 'jane' };

  beforeAll(() => {
    client = createTestClient();
    client.connectUser(user, createTestTokenGenerator(user));
  });

  it('should set HTTP headers', async () => {
    let headers: Record<string, string> = {};
    client['axios'].interceptors.request.use((config) => {
      headers = config.headers;
      return config;
    });

    await client.getApp();

    expect(typeof headers['Authorization']).toBe('string');
    expect(headers['stream-auth-type']).toBe('jwt');
    expect(typeof headers['x-client-request-id']).toBe('string');
    expect(headers['X-Stream-Client']).toBe('stream-feeds-js-');
  });

  it('should return response body', async () => {
    const response = await client.queryUsers({
      payload: { filter_conditions: {} },
    });

    expect(response.users).toBeDefined();
  });

  it('should return rate limit information', async () => {
    const response = await client.queryUsers({
      payload: { filter_conditions: {} },
    });

    expect(typeof response.metadata.rateLimit.rateLimit).toBe('number');
    expect(typeof response.metadata.rateLimit.rateLimitRemaining).toBe(
      'number',
    );
    expect(response.metadata.rateLimit.rateLimitReset instanceof Date).toBe(
      true,
    );
  });

  it('should handle error response from Stream API', async () => {
    try {
      await client.queryUsers();
      throw new Error(`Test failed because method didn't throw`);
    } catch (error) {
      expect(error.message).toBe(
        'Stream error code 4: QueryUsers failed with error: "invalid json data"',
      );
      expect(error.code).toBe(4);
      expect(error.metadata).toBeDefined();
      expect(error.metadata.responseCode).toBe(400);

      const rateLimit = error.metadata.rateLimit;

      expect(rateLimit.rateLimit).toBeDefined();
    }
  });

  it('should handle timeout', async () => {
    client = createTestClient({ timeout: 1 });
    client.connectUser(user, createTestTokenGenerator(user));

    await expect(() => client.getApp()).rejects.toThrowError(
      'Stream error timeout of 1ms exceeded',
    );
  });
});
