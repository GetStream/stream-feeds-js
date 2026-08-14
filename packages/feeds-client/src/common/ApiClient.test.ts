import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosRequestConfig } from 'axios';
import { ApiClient } from './ApiClient';
import type { FeedsClientOptions } from './types';
import type { TokenManager } from './TokenManager';
import type { ConnectionIdManager } from './ConnectionIdManager';

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({ request: requestMock })),
  },
}));

const API_KEY = 'test-api-key';
const TOKEN = 'test-token';

const createApiClient = (options?: FeedsClientOptions) => {
  const tokenManager = {
    getToken: vi.fn().mockResolvedValue(TOKEN),
    isAnonymous: false,
    isStatic: () => true,
  } as unknown as TokenManager;

  const connectionIdManager = {
    getConnectionId: vi.fn().mockResolvedValue(undefined),
  } as unknown as ConnectionIdManager;

  return new ApiClient(API_KEY, tokenManager, connectionIdManager, options);
};

// The only argument passed to `axiosInstance.request` for the latest call.
const lastRequestConfig = (): AxiosRequestConfig =>
  requestMock.mock.calls.at(-1)![0];

describe('ApiClient', () => {
  beforeEach(() => {
    requestMock.mockReset();
    requestMock.mockResolvedValue({ data: {}, status: 200, headers: {} });
  });

  it('sends the SDK headers when no custom config is provided', async () => {
    const apiClient = createApiClient();

    await apiClient.sendRequest('GET', '/app');

    const { headers } = lastRequestConfig();
    expect(headers).toEqual({
      Authorization: TOKEN,
      'stream-auth-type': 'jwt',
      'X-Stream-Client': apiClient.generateStreamClientHeader(),
      'Content-Type': 'application/json',
      'x-client-request-id': expect.any(String),
    });
  });

  describe('custom_headers', () => {
    it('sends custom headers along with every request', async () => {
      const apiClient = createApiClient({
        custom_headers: {
          'x-stream-ext': 'my-value',
          'x-tenant-id': 'tenant-1',
        },
      });

      await apiClient.sendRequest('GET', '/app');
      await apiClient.sendRequest('POST', '/feeds');

      expect(requestMock).toHaveBeenCalledTimes(2);
      for (const call of requestMock.mock.calls) {
        expect(call[0].headers).toMatchObject({
          'x-stream-ext': 'my-value',
          'x-tenant-id': 'tenant-1',
        });
      }
    });

    it('cannot overwrite the SDK managed headers', async () => {
      const apiClient = createApiClient({
        custom_headers: {
          Authorization: 'malicious-token',
          'stream-auth-type': 'anonymous',
          'X-Stream-Client': 'not-the-sdk',
          'Content-Type': 'text/plain',
          'x-client-request-id': 'fixed-id',
        },
      });

      await apiClient.sendRequest('GET', '/app');

      const { headers } = lastRequestConfig();
      expect(headers).toMatchObject({
        Authorization: TOKEN,
        'stream-auth-type': 'jwt',
        'X-Stream-Client': apiClient.generateStreamClientHeader(),
        'Content-Type': 'application/json',
      });
      expect(headers!['x-client-request-id']).not.toBe('fixed-id');
    });

    it('does not change the rest of the request config', async () => {
      const apiClient = createApiClient({
        timeout: 1234,
        custom_headers: { 'x-stream-ext': 'my-value' },
      });

      await apiClient.sendRequest('GET', '/app');

      const config = lastRequestConfig();
      expect(config.url).toBe('/app');
      expect(config.method).toBe('GET');
      expect(config.params).toEqual({ api_key: API_KEY });
      expect(config.timeout).toBe(1234);
    });

    it('does not leak custom headers into the WebSocket URL', () => {
      const apiClient = createApiClient({
        custom_headers: { 'x-stream-ext': 'my-value' },
      });

      expect(apiClient.webSocketBaseUrl).not.toContain('x-stream-ext');
    });
  });
});
