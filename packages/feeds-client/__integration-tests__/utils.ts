import { FeedsClient } from '../src/feeds-client';
import type { Feed } from '../src/feed';
import type { UserRequest } from '../src/gen/models';
import type { FeedsClientOptions } from '../src/common/types';
import type { WSEvent } from '../src/gen/models';
import type { FeedsEvent } from '../src/types';
import { StreamClient } from '@stream-io/node-sdk';
import { randomId } from '../src/common/utils';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;
const secret = import.meta.env.VITE_STREAM_API_SECRET;
const baseUrl = import.meta.env.VITE_API_URL;

export const createTestClient = (options?: FeedsClientOptions) => {
  if (!apiKey) {
    throw new Error('Provide an api key, check .env-example for details');
  }
  return new FeedsClient(apiKey, {
    base_url: baseUrl,
    timeout: 10000,
    ...options,
  });
};

let serverClient: StreamClient;
export const getServerClient = () => {
  if (!apiKey || !secret) {
    throw new Error(
      'Provide an api key and secret, check .env-example for details',
    );
  }
  if (!serverClient) {
    serverClient = new StreamClient(apiKey, secret, {
      basePath: baseUrl,
      timeout: 10000,
    });
  }
  return serverClient;
};

export const createTestTokenGenerator = (
  user: UserRequest,
  expInSeconds?: number,
) => {
  const client = getServerClient();

  return async () => {
    const token = client.generateUserToken({
      user_id: user.id,
      validity_in_seconds: expInSeconds,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    return token;
  };
};

export const getTestUser = () => {
  return { id: `emily-${randomId()}` };
};

export const waitForEvent = (
  client: FeedsClient | Feed,
  type: FeedsEvent['type'] | WSEvent['type'],
  {
    timeoutMs = 3000,
    shouldReject = false,
  }: {
    timeoutMs?: number;
    shouldReject?: boolean;
  } = {},
) => {
  return new Promise((resolve, reject) => {
    // @ts-expect-error client expects WSEvents
    client.on(type, (e) => {
      resolve(undefined);
      clearTimeout(timeout);
    });
    const timeout = setTimeout(() => {
      if (shouldReject) {
        reject(new Error(`Event not received: ${type}`));
      } else {
        resolve(undefined);
      }
    }, timeoutMs);
  });
};
