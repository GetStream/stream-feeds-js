import { StreamClientOptions, UserRequest } from '@stream-io/common';
import { StreamFeedsClient } from '../src/StreamFeedsClient';

const apiKey = import.meta.env.VITE_STREAM_API_KEY!;
const tokenUrl = import.meta.env.VITE_STREAM_TOKEN_URL!;

export const createTestClient = (options?: StreamClientOptions) => {
  return new StreamFeedsClient(apiKey, {
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
      `${tokenUrl}&user_id=${user.id}&exp=${expInSeconds ?? 14400}`,
    );
    const body = await response.json();

    return body.token as string;
  };
};
