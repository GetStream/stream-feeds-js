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

export const getTestUser = (name = 'emily') => {
  return { id: `${name}-${randomId()}` };
};

const WAIT_FOR_EVENT_MS = 30_000;

export const waitForEvent = (
  client: FeedsClient | Feed,
  type: FeedsEvent['type'] | WSEvent['type'],
) => {
  return new Promise((resolve, reject) => {
    const listener = (e: FeedsEvent | WSEvent) => {
      // @ts-expect-error client expects WSEvents
      client.off(type, listener);
      clearTimeout(timeout);
      resolve(e);
    };

    const timeout = setTimeout(() => {
      // @ts-expect-error client expects WSEvents
      client.off(type, listener);
      reject(new Error(`Event not received: ${type}`));
    }, WAIT_FOR_EVENT_MS);

    // @ts-expect-error client expects WSEvents
    client.on(type, listener);
  });
};
