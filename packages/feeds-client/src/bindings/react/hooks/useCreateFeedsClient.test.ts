/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateFeedsClient } from './useCreateFeedsClient';

vi.mock('../../../feeds-client', () => {
  const connectAnonymous = vi.fn();
  const connectGuest = vi.fn();
  const connectUser = vi.fn();
  const disconnectUser = vi.fn();
  (globalThis as Record<string, unknown>)['__useCreateFeedsClient_mocks'] = {
    connectAnonymous,
    connectGuest,
    connectUser,
    disconnectUser,
  };
  return {
    FeedsClient: vi.fn().mockImplementation(() => ({
      connectAnonymous,
      connectGuest,
      connectUser,
      disconnectUser,
    })),
  };
});

function getMocks() {
  return (globalThis as Record<string, unknown>)['__useCreateFeedsClient_mocks'] as {
    connectAnonymous: ReturnType<typeof vi.fn>;
    connectGuest: ReturnType<typeof vi.fn>;
    connectUser: ReturnType<typeof vi.fn>;
    disconnectUser: ReturnType<typeof vi.fn>;
  };
}

describe('useCreateFeedsClient', () => {
  beforeEach(() => {
    const m = getMocks();
    vi.mocked(m.connectAnonymous).mockResolvedValue(undefined);
    vi.mocked(m.connectGuest).mockResolvedValue({} as never);
    vi.mocked(m.connectUser).mockResolvedValue(undefined);
    vi.mocked(m.disconnectUser).mockResolvedValue(undefined);
    vi.mocked(m.connectAnonymous).mockClear();
    vi.mocked(m.connectGuest).mockClear();
    vi.mocked(m.connectUser).mockClear();
    vi.mocked(m.disconnectUser).mockClear();
  });

  afterEach(() => {
    // Keep FeedsClient module mock in place; only clear call history in beforeEach
  });

  describe('client method calls', () => {
    it('calls connectAnonymous when userData is "anonymous"', async () => {
      const { result } = renderHook(() =>
        useCreateFeedsClient({
          apiKey: 'test-key',
          userData: 'anonymous',
        }),
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(getMocks().connectAnonymous).toHaveBeenCalledTimes(1);
      expect(getMocks().connectGuest).not.toHaveBeenCalled();
      expect(getMocks().connectUser).not.toHaveBeenCalled();
    });

    it('calls connectGuest with user when userData is provided and tokenOrProvider is "guest"', async () => {
      const userData = { id: 'user-1', name: 'Test User' };
      const { result } = renderHook(() =>
        useCreateFeedsClient({
          apiKey: 'test-key',
          userData,
          tokenOrProvider: 'guest',
        }),
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(getMocks().connectGuest).toHaveBeenCalledTimes(1);
      expect(getMocks().connectGuest).toHaveBeenCalledWith({ user: userData });
      expect(getMocks().connectAnonymous).not.toHaveBeenCalled();
      expect(getMocks().connectUser).not.toHaveBeenCalled();
    });

    it('calls connectUser with user and token when userData and tokenOrProvider (string) are provided', async () => {
      const userData = { id: 'user-1' };
      const token = 'jwt-token';
      const { result } = renderHook(() =>
        useCreateFeedsClient({
          apiKey: 'test-key',
          userData,
          tokenOrProvider: token,
        }),
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(getMocks().connectUser).toHaveBeenCalledTimes(1);
      expect(getMocks().connectUser).toHaveBeenCalledWith(userData, token);
      expect(getMocks().connectAnonymous).not.toHaveBeenCalled();
      expect(getMocks().connectGuest).not.toHaveBeenCalled();
    });

    it('calls connectUser with user and token provider when tokenOrProvider is a function', async () => {
      const userData = { id: 'user-1' };
      const tokenProvider = vi.fn().mockResolvedValue('jwt-from-provider');
      const { result } = renderHook(() =>
        useCreateFeedsClient({
          apiKey: 'test-key',
          userData,
          tokenOrProvider: tokenProvider,
        }),
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(getMocks().connectUser).toHaveBeenCalledTimes(1);
      expect(getMocks().connectUser).toHaveBeenCalledWith(userData, tokenProvider);
      expect(getMocks().connectAnonymous).not.toHaveBeenCalled();
      expect(getMocks().connectGuest).not.toHaveBeenCalled();
    });

    it('calls disconnectUser on unmount', async () => {
      const { result, unmount } = renderHook(() =>
        useCreateFeedsClient({
          apiKey: 'test-key',
          userData: 'anonymous',
        }),
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(getMocks().connectAnonymous).toHaveBeenCalledTimes(1);
      expect(getMocks().disconnectUser).not.toHaveBeenCalled();

      unmount();

      await waitFor(() => {
        expect(getMocks().disconnectUser).toHaveBeenCalledTimes(1);
      });
    });

    it('creates client with apiKey and options', async () => {
      const options = { base_url: 'https://custom.api' };
      const { result } = renderHook(() =>
        useCreateFeedsClient({
          apiKey: 'my-api-key',
          userData: 'anonymous',
          options,
        }),
      );

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(getMocks().connectAnonymous).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation', () => {
    it('throws when userData is not anonymous and tokenOrProvider is omitted', () => {
      expect(() =>
        renderHook(() =>
          useCreateFeedsClient({
            apiKey: 'test-key',
            userData: { id: 'user-1' },
            // tokenOrProvider intentionally omitted
          }),
        ),
      ).toThrow(
        'Token provider can only be omitted when connecting anonymous user. If you want to connect as a guest, provide "guest" instead of a token provider.',
      );

      expect(getMocks().connectAnonymous).not.toHaveBeenCalled();
      expect(getMocks().connectGuest).not.toHaveBeenCalled();
      expect(getMocks().connectUser).not.toHaveBeenCalled();
    });
  });

  describe('reconnection when dependencies change', () => {
    it('calls connectAnonymous again when apiKey changes', async () => {
      const { rerender } = renderHook(
        (props: { apiKey: string }) =>
          useCreateFeedsClient({
            apiKey: props.apiKey,
            userData: 'anonymous',
          }),
        { initialProps: { apiKey: 'key-1' } },
      );

      await waitFor(() => {
        expect(getMocks().connectAnonymous).toHaveBeenCalledTimes(1);
      });

      rerender({ apiKey: 'key-2' });

      await waitFor(() => {
        expect(getMocks().connectAnonymous).toHaveBeenCalledTimes(2);
      });
    });

    it('calls connectGuest with new user when userData id changes', async () => {
      const { rerender } = renderHook(
        (props: { userData: { id: string } }) =>
          useCreateFeedsClient({
            apiKey: 'test-key',
            userData: props.userData,
            tokenOrProvider: 'guest',
          }),
        { initialProps: { userData: { id: 'user-1' } } },
      );

      await waitFor(() => {
        expect(getMocks().connectGuest).toHaveBeenCalledTimes(1);
        expect(getMocks().connectGuest).toHaveBeenCalledWith({ user: { id: 'user-1' } });
      });

      rerender({ userData: { id: 'user-2' } });

      await waitFor(() => {
        expect(getMocks().connectGuest).toHaveBeenCalledTimes(2);
        expect(getMocks().connectGuest).toHaveBeenLastCalledWith({ user: { id: 'user-2' } });
      });
    });
  });
});
