import { StreamClient } from '../src/StreamClient';
import { UserRequest } from '../src/gen/models';
import { StreamClientOptions } from '../src/types';

const apiKey = import.meta.env.VITE_STREAM_API_KEY!;

export const createTestClient = (options?: StreamClientOptions) => {
  return new StreamClient(apiKey, {
    timeout: 10000,
    ...options,
  });
};

export const createTestTokenGenerator = (
  user: UserRequest,
  expInSeconds?: number,
) => {
  return async () => {
    const response = await fetch(
      `https://stream-calls-dogfood.vercel.app/api/auth/create-token?user_id=${user.id}&environment=staging&exp=${expInSeconds ?? 14400}`,
    );
    const body = await response.json();

    return body.token as string;
  };
};
