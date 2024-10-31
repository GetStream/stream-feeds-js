import { beforeAll, describe, expect, it } from 'vitest';
import { StreamClient } from '../src/StreamClient';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { UserRequest } from '../src/gen/models';
import { sleep } from '../src/utils';

describe('API requests and error handling', () => {
  let client: StreamClient;
  const user: UserRequest = getTestUser();

  beforeAll(async () => {
    client = createTestClient();
    void client.connectUser(user, createTestTokenGenerator(user));
  });

  it('should set HTTP headers', async () => {
    let headers: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/dot-notation
    client['apiClient']['axiosInstance'].interceptors.request.use((config) => {
      headers = config.headers;
      return config;
    });

    await client.getApp();

    expect(typeof headers.Authorization).toBe('string');
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

  it.skipIf(import.meta.env.VITE_API_URL?.includes('localhost'))(
    'should return rate limit information',
    async () => {
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
    },
  );

  it.skipIf(import.meta.env.VITE_API_URL?.includes('localhost'))(
    'should handle error response from Stream API',
    async () => {
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
    },
  );

  it('should handle token expiration', async () => {
    client = createTestClient();
    const expInSecs = 2;
    void client.connectUser(user, createTestTokenGenerator(user, expInSecs));

    await sleep(expInSecs * 1000);

    await client.queryUsers({ payload: { filter_conditions: {} } });
  });

  it('should add connection id when necessary', async () => {
    let url: string | undefined;
    // eslint-disable-next-line @typescript-eslint/dot-notation
    client['apiClient']['axiosInstance'].interceptors.request.use((config) => {
      url = config.url;
      return config;
    });

    await client.queryUsers({ payload: { filter_conditions: {} } });

    expect(url).not.toContain('connection_id=');

    await client.queryUsers({
      payload: { filter_conditions: {}, presence: true },
    });

    expect(url).toContain('connection_id=');
  });

  it('should give up token refresh after 3 tries', async () => {
    client = createTestClient();
    const tokenProvider = () =>
      Promise.reject(new Error('This is a test error'));
    void client.connectUser(user, tokenProvider);

    await expect(() =>
      client.queryUsers({ payload: { filter_conditions: {} } }),
    ).rejects.toThrowError(
      'Stream error: tried to get token 3 times, but it failed. Check your token provider',
    );

    await client.disconnectUser();
  });

  it('should handle timeout', async () => {
    client = createTestClient({ timeout: 1 });
    void client.connectUser(user, createTestTokenGenerator(user));

    await expect(() => client.getApp()).rejects.toThrowError(
      'Stream error timeout of 1ms exceeded',
    );
  });
});
