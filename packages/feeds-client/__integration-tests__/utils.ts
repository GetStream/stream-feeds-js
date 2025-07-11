import { FeedsClient } from '../src/FeedsClient';
import { Feed } from '../src/Feed';
import { UserRequest } from '../src/gen/models';
import { FeedsClientOptions } from '../src/common/types';
import { WSEvent } from '../src/gen/models';
import { FeedsEvent } from '../src/types';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;
const tokenUrl = import.meta.env.VITE_STREAM_TOKEN_URL;
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

export const createTestTokenGenerator = (
  user: UserRequest,
  expInSeconds?: number,
) => {
  if (!tokenUrl) {
    throw new Error('Provide token url, check .env-example for details');
  }
  return async () => {
    const response = await fetch(
      `${tokenUrl}&user_id=${user.id}&exp=${expInSeconds ?? 14400}`,
    );
    const body = await response.json();

    return body.token as string;
  };
};

export const getTestUser = () => {
  return { id: 'emily' };
};

export const waitForEvent = (
  client: FeedsClient | Feed,
  type: FeedsEvent['type'] | WSEvent['type'],
  timeoutMs = 3000,
) => {
  return new Promise((resolve) => {
    // @ts-expect-error client expects WSEvents
    client.on(type, () => {
      resolve(undefined);
      clearTimeout(timeout);
    });
    const timeout = setTimeout(resolve, timeoutMs);
  });
};
