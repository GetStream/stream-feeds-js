import { StreamClient } from '../src/StreamClient';
import { UserRequest } from '../src/gen/models';
import { StreamClientOptions } from '../src/types';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;
const tokenUrl = import.meta.env.VITE_STREAM_TOKEN_URL;
const baseUrl = import.meta.env.VITE_API_URL;

export const createTestClient = (options?: StreamClientOptions) => {
  if (!apiKey) {
    throw new Error('Provide an api key, check .env-example for details');
  }
  return new StreamClient(apiKey, {
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
