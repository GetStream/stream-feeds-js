import { afterEach, describe, expect, it } from 'vitest';
import {
  createTestClient,
  createTestTokenGenerator,
  getTestUser,
} from './utils';
import { sleep } from '../src/common/utils';
import { FeedsClient } from '../src/feeds-client';
import { UserRequest } from '../src/gen/models';

describe('API requests and error handling', () => {
  let client: FeedsClient;
  const user: UserRequest = getTestUser();
  let connectUserPromise: Promise<void> | null;

  it('should set HTTP headers', async () => {
    client = createTestClient();
    connectUserPromise = client.connectUser(
      user,
      createTestTokenGenerator(user),
    );
    let headers: Record<string, string> = {};

    // @ts-expect-error need to access private property
    client.apiClient.axiosInstance.interceptors.request.use((config) => {
      headers = config.headers;
      return config;
    });

    await client.getApp();

    expect(typeof headers.Authorization).toBe('string');
    expect(headers['stream-auth-type']).toBe('jwt');
    expect(typeof headers['x-client-request-id']).toBe('string');
    expect(headers['X-Stream-Client']).toMatch(/stream-feeds-js-(v\d+\.\d+\.\d+)/);
  });

  it('should return response body', async () => {
    client = createTestClient();
    connectUserPromise = client.connectUser(
      user,
      createTestTokenGenerator(user),
    );

    const response = await client.queryUsers({
      payload: { filter_conditions: {} },
    });

    expect(response.users).toBeDefined();
  });

  it.skipIf(import.meta.env.VITE_API_URL?.includes('localhost'))(
    'should return rate limit information',
    async () => {
      client = createTestClient();
      connectUserPromise = client.connectUser(
        user,
        createTestTokenGenerator(user),
      );

      const response = await client.queryUsers({
        payload: { filter_conditions: {} },
      });

      expect(typeof response.metadata.rate_limit.rate_limit).toBe('number');
      expect(typeof response.metadata.rate_limit.rate_limit_remaining).toBe(
        'number',
      );
      expect(
        response.metadata.rate_limit.rate_limit_reset instanceof Date,
      ).toBe(true);
    },
  );

  it.skipIf(import.meta.env.VITE_API_URL?.includes('localhost'))(
    'should handle error response from Stream API',
    async () => {
      client = createTestClient();
      connectUserPromise = client.connectUser(
        user,
        createTestTokenGenerator(user),
      );

      try {
        await client.queryUsers();
        throw new Error(`Test failed because method didn't throw`);
      } catch (error: any) {
        expect(error.message).toBe(
          'Stream error code 4: QueryUsers failed with error: "invalid json data"',
        );
        expect(error.code).toBe(4);
        expect(error.metadata).toBeDefined();
        expect(error.metadata.response_code).toBe(400);

        const rate_limit = error.metadata.rate_limit;

        expect(rate_limit.rate_limit).toBeDefined();
      }
    },
  );

  it('should handle token expiration', async () => {
    client = createTestClient();
    const expInSecs = 2;
    connectUserPromise = client
      .connectUser(user, createTestTokenGenerator(user, expInSecs))
      // Catch the error, we test queryUsers here
      .catch(() => {});

    await sleep(expInSecs * 1000);

    await client.queryUsers({ payload: { filter_conditions: {} } });
  });

  it('should add connection id when necessary', async () => {
    client = createTestClient();
    connectUserPromise = client.connectUser(
      user,
      createTestTokenGenerator(user),
    );

    let params: any;

    // @ts-expect-error need to access private property
    client.apiClient.axiosInstance.interceptors.request.use((config) => {
      params = config.params;
      return config;
    });

    await client.queryUsers({ payload: { filter_conditions: {} } });

    expect(params.connection_id).toBeUndefined();

    await client.queryUsers({
      payload: { filter_conditions: {}, presence: true },
    });

    expect(params.connection_id).toBeDefined();
  });

  it('should give up token refresh after 3 tries - WS connection', async () => {
    client = createTestClient();

    const tokenProvider = () =>
      Promise.reject(new Error('This is a test error'));

    await expect(() =>
      client.connectUser(user, tokenProvider),
    ).rejects.toThrowError(
      'Stream error: tried to get token 3 times, but it failed with Error: This is a test error. Check your token provider',
    );

    connectUserPromise = null;
  });

  it('should give up token refresh after 3 tries - API request', async () => {
    client = createTestClient();

    const tokenProvider = () =>
      Promise.reject(new Error('This is a test error'));

    connectUserPromise = client
      .connectUser(user, tokenProvider)
      .catch(() => {});

    await expect(() =>
      client.queryUsers({ payload: { filter_conditions: {} } }),
    ).rejects.toThrowError(
      'Stream error: tried to get token 3 times, but it failed with Error: This is a test error. Check your token provider',
    );
  }, 30000);

  it('should handle timeout', async () => {
    client = createTestClient({ timeout: 1 });
    connectUserPromise = client.connectUser(
      user,
      createTestTokenGenerator(user),
    );

    await expect(() => client.getApp()).rejects.toThrowError(
      'Stream error timeout of 1ms exceeded',
    );
  });

  afterEach(async () => {
    await connectUserPromise;
    await client.disconnectUser();
  });
});
